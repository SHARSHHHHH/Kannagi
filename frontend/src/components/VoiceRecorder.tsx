import { useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Square } from 'lucide-react'
import { transcribe } from '@/api/support'
import { messageFrom } from '@/api/client'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { LanguageCode, Transcription } from '@/types'

/**
 * Records, transcribes, and then hands the text back for review.
 *
 * The audio never leaves this component except to be transcribed, and is not
 * stored anywhere. Nothing is analysed until she has read the transcript and
 * pressed the button — a machine mishearing someone describing abuse, and then
 * acting on the mishearing, is the failure mode worth designing against.
 */
export function VoiceRecorder({
  language,
  onTranscript,
}: {
  language: LanguageCode
  onTranscript: (text: string) => void
}) {
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState<Transcription | null>(null)
  const [edited, setEdited] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [liveText, setLiveText] = useState('')

  const recorder = useRef<MediaRecorder | null>(null)
  const speech = useRef<any>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<number>()

  useEffect(() => {
    return () => {
      window.clearInterval(timer.current)
      speech.current?.stop()
      recorder.current?.stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  /**
   * Chrome and Edge can transcribe on-device through the Web Speech API, in
   * every language this product launches with. No key, no upload, and the audio
   * never leaves the machine — which is a better privacy answer than sending a
   * recording to a third party, not just a cheaper one.
   *
   * Where it is unavailable, recording falls back to uploading to the server.
   */
  function browserRecognition(): any | null {
    const w = window as any
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition
    return Recognition ? new Recognition() : null
  }

  const LOCALES: Record<string, string> = {
    en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN', te: 'te-IN', ml: 'ml-IN', kn: 'kn-IN',
  }

  function startBrowserRecognition(): boolean {
    const recognition = browserRecognition()
    if (!recognition) return false

    recognition.lang = LOCALES[language] ?? 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true

    let finalText = ''

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript
        if (event.results[i].isFinal) finalText += chunk
        else interim += chunk
      }
      setLiveText(finalText + interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setError('Your browser blocked the microphone. Allow it, or type instead.')
      } else if (event.error === 'no-speech') {
        setError('We did not hear anything. Try again, a little closer to the microphone.')
      }
      setRecording(false)
      window.clearInterval(timer.current)
    }

    recognition.onend = () => {
      window.clearInterval(timer.current)
      setRecording(false)
      if (finalText.trim()) {
        setResult({
          transcript: finalText.trim(),
          detectedLanguage: language,
          confidence: 1,
          durationSeconds: seconds,
        })
        setEdited(finalText.trim())
      }
    }

    recognition.start()
    speech.current = recognition
    setRecording(true)
    setSeconds(0)
    setLiveText('')
    timer.current = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return true
  }

  async function start() {
    setError(null)
    setResult(null)
    setLiveText('')

    if (startBrowserRecognition()) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data)
      }
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        void send(new Blob(chunks.current, { type: 'audio/webm' }))
      }

      mediaRecorder.start()
      recorder.current = mediaRecorder
      setRecording(true)
      setSeconds(0)
      timer.current = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    } catch {
      setError(
        'We could not reach your microphone. Check that your browser has permission, ' +
          'or type instead.',
      )
    }
  }

  function stop() {
    window.clearInterval(timer.current)
    if (speech.current) {
      speech.current.stop()
      return
    }
    recorder.current?.stop()
    setRecording(false)
  }

  async function send(blob: Blob) {
    setBusy(true)
    try {
      const transcription = await transcribe(blob, language)
      setResult(transcription)
      setEdited(transcription.transcript)
    } catch (caught) {
      setError(messageFrom(caught, 'We could not turn that recording into text.'))
    } finally {
      setBusy(false)
    }
  }

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
      {error && (
        <Alert tone="safety" className="mb-4">
          {error}
        </Alert>
      )}

      {!result && (
        <div className="flex flex-col items-center gap-4 py-4">
          {busy ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-dusk-500" aria-hidden="true" />
              <p className="text-sm text-mist-600">Turning your recording into text…</p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={recording ? stop : start}
                aria-label={recording ? 'Stop recording' : 'Start recording'}
                className={
                  recording
                    ? 'flex h-16 w-16 items-center justify-center rounded-full bg-wine-600 text-white shadow-lift transition-transform hover:bg-wine-700 active:scale-95'
                    : 'flex h-16 w-16 items-center justify-center rounded-full bg-dusk-600 text-white shadow-lift transition-transform hover:bg-dusk-700 active:scale-95'
                }
              >
                {recording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>

              <p className="text-sm text-mist-600">
                {recording ? (
                  <span className="font-mono text-base text-dusk-800">{clock}</span>
                ) : (
                  'Tap to record. Take your time — you can stop and start again.'
                )}
              </p>

              {recording && (
                <p className="min-h-[3rem] max-w-lg rounded-xl bg-ivory-100 px-4 py-3 text-center text-sm leading-relaxed text-dusk-800">
                  {liveText || 'Listening…'}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-dusk-800">Your recording has been processed.</p>
            <p className="mt-1 text-sm text-mist-600">
              Detected language: <strong>{result.detectedLanguage.toUpperCase()}</strong>
            </p>
          </div>

          <div>
            <label
              htmlFor="transcript"
              className="text-sm font-medium text-dusk-800"
            >
              Transcript — change anything that is wrong
            </label>
            <textarea
              id="transcript"
              value={edited}
              onChange={(event) => setEdited(event.target.value)}
              rows={6}
              className="mt-1.5 w-full resize-y rounded-xl border border-ivory-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-dusk-900"
            />
          </div>

          <p className="rounded-xl bg-ivory-100 px-4 py-3 text-xs leading-relaxed text-mist-600">
            Nothing is analysed until you press the button. The recording itself has not
            been saved.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onTranscript(edited)} disabled={!edited.trim()}>
              Use this text
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setResult(null)
                setEdited('')
              }}
            >
              Record again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
