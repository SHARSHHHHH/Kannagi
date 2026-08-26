package com.kannagi.seed;

import com.kannagi.community.CommunityPostRepository;
import com.kannagi.community.domain.CommunityPost;
import com.kannagi.lawyer.ProfessionalRepository;
import com.kannagi.lawyer.domain.Professional;
import com.kannagi.legal.LegalCaseRepository;
import com.kannagi.legal.LegalRepository;
import com.kannagi.legal.domain.LegalCaseSummary;
import com.kannagi.legal.domain.LegalResource;
import com.kannagi.privacy.crypto.BlindIndexService;
import com.kannagi.user.UserRepository;
import com.kannagi.user.domain.Role;
import com.kannagi.user.domain.User;
import com.kannagi.user.domain.UserProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Development seed data.
 *
 * Every professional here is invented and flagged {@code isDemo}, which the
 * interface renders as a DEMO PROFILE badge. No real practitioner's name,
 * registration number or contact details appear anywhere in this file.
 *
 * The legal rows are the sensitive part. Each carries a source URL and a
 * verification date, and the seeder deliberately marks them as requiring
 * confirmation before any real deployment — a plausible-looking citation that
 * nobody checked is worse than no citation at all.
 *
 * Runs only under the dev profile.
 */
@Configuration
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder {

    private static final String VERIFIER = "PROTOTYPE SEED — CONFIRM BEFORE RELYING ON THIS";

    private final UserRepository userRepository;
    private final ProfessionalRepository professionalRepository;
    private final LegalRepository legalRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final CommunityPostRepository postRepository;
    private final PasswordEncoder passwordEncoder;
    private final BlindIndexService blindIndexService;

    @Bean
    public ApplicationRunner seedDemoData() {
        return args -> {
            // Each section is independent. One failure must not leave the rest
            // of the demo empty, and a silent failure must not look like success.
            runSafely("accounts", this::seedAccounts);
            runSafely("professionals", this::seedProfessionals);
            runSafely("legal resources", this::seedLegalResources);
            runSafely("legal cases", this::seedLegalCases);
            runSafely("community posts", this::seedCommunityPosts);

            log.info("Seed complete — users:{} professionals:{} legal:{} posts:{}",
                    userRepository.count(), professionalRepository.count(),
                    legalRepository.count(), postRepository.count());
            log.info("Sign in with user@kannagi.demo / DemoPass!2026");
        };
    }

    private void runSafely(String what, Runnable task) {
        try {
            task.run();
        } catch (Exception e) {
            log.error("Could not seed {} — that section will be empty", what, e);
        }
    }

    @Transactional
    void seedAccounts() {
        if (userRepository.count() > 0) {
            return;
        }
        record Account(String email, Role role, String name) {}

        List.of(
                new Account("admin@kannagi.demo", Role.ADMIN, "Demo Admin"),
                new Account("lawyer@kannagi.demo", Role.LAWYER, "Demo Lawyer"),
                new Account("psychologist@kannagi.demo", Role.PSYCHOLOGIST, "Demo Psychologist"),
                new Account("support@kannagi.demo", Role.SUPPORT_WORKER, "Demo Support Worker"),
                new Account("moderator@kannagi.demo", Role.MODERATOR, "Demo Moderator"),
                new Account("user@kannagi.demo", Role.USER, "Demo User")
        ).forEach(account -> {
            User user = User.builder()
                    .emailIndex(blindIndexService.forEmail(account.email()))
                    .email(account.email())
                    // Development only. Documented in the README and never shipped.
                    .passwordHash(passwordEncoder.encode("DemoPass!2026"))
                    .role(account.role())
                    .build();
            user.setProfile(UserProfile.builder()
                    .user(user)
                    .displayName(account.name())
                    .city("Chennai")
                    .state("Tamil Nadu")
                    .preferredLanguage("en")
                    .build());
            userRepository.save(user);
        });

        log.warn("Seeded 6 demo accounts with a shared development password. "
               + "These must never exist in a real deployment.");
    }

    @Transactional
    void seedProfessionals() {
        if (professionalRepository.count() > 0) {
            return;
        }

        List.of(
                lawyer("Adv. Meera Raghavan", "LL.B., LL.M. (Constitutional Law)",
                        "Workplace harassment, Employment", "ta,en", "Chennai", "Tamil Nadu",
                        12, "4.7", true, "First consultation free, then from Rs 2,500"),
                lawyer("Adv. Kavitha Subramanian", "LL.B.",
                        "Domestic violence, Family law", "ta,en", "Coimbatore", "Tamil Nadu",
                        9, "4.6", true, "Sliding scale based on income"),
                lawyer("Adv. Nandini Iyer", "LL.B., Diploma in Cyber Law",
                        "Stalking, Online harassment", "ta,en,hi", "Chennai", "Tamil Nadu",
                        7, "4.5", false, "From Rs 3,000 per consultation"),
                lawyer("Adv. Priya Deshmukh", "LL.B.",
                        "Dowry harassment, Domestic violence", "hi,en,mr", "Pune", "Maharashtra",
                        15, "4.8", true, "Legal aid cases taken without fee"),
                lawyer("Adv. Fathima Noor", "LL.B., LL.M.",
                        "Workplace harassment, Labour law", "ml,en", "Kochi", "Kerala",
                        11, "4.6", true, "First consultation free"),
                lawyer("Adv. Sunitha Reddy", "LL.B.",
                        "Family law, Maintenance", "te,en", "Hyderabad", "Telangana",
                        13, "4.4", true, "Sliding scale"),
                lawyer("Adv. Lakshmi Narayanan", "LL.B., Diploma in Human Rights",
                        "Sexual harassment, Criminal law", "ta,en", "Madurai", "Tamil Nadu",
                        18, "4.9", true, "Legal aid panel member"),
                lawyer("Adv. Anjali Bhatt", "LL.B.",
                        "Property, Financial abuse", "hi,en,gu", "Ahmedabad", "Gujarat",
                        8, "4.3", false, "From Rs 2,000"),
                lawyer("Adv. Divya Krishnan", "LL.B.",
                        "Education law, Student rights", "kn,en,ta", "Bengaluru", "Karnataka",
                        6, "4.5", true, "Free for students"),
                lawyer("Adv. Rekha Menon", "LL.B., LL.M.",
                        "Workplace harassment, Employment", "ml,en,ta", "Thiruvananthapuram",
                        "Kerala", 14, "4.7", true, "First consultation free"),

                psychologist("Dr. Anitha Vasudevan", "M.Phil. Clinical Psychology",
                        "Trauma, Anxiety", "ta,en", "Chennai", "Tamil Nadu", 10, "4.8",
                        "Rs 800 per session, reduced rates available"),
                psychologist("Dr. Shalini Prakash", "Ph.D. Counselling Psychology",
                        "Domestic abuse recovery, PTSD", "ta,en,hi", "Chennai", "Tamil Nadu",
                        14, "4.9", "Rs 1,200 per session"),
                psychologist("Ms. Divya Rajan", "M.Sc. Psychology, RCI registered",
                        "Workplace stress, Burnout", "ta,en", "Coimbatore", "Tamil Nadu",
                        6, "4.5", "Rs 600 per session"),
                psychologist("Dr. Preeti Sharma", "M.Phil. Clinical Psychology",
                        "Trauma, Family conflict", "hi,en", "Delhi", "Delhi", 12, "4.7",
                        "Rs 1,000 per session"),
                psychologist("Ms. Sneha Pillai", "M.Sc. Clinical Psychology",
                        "Anxiety, Self-esteem", "ml,en", "Kochi", "Kerala", 5, "4.4",
                        "Rs 700 per session"),
                psychologist("Dr. Lalitha Rao", "Ph.D. Clinical Psychology",
                        "Trauma, Grief", "te,en", "Hyderabad", "Telangana", 16, "4.8",
                        "Rs 1,500 per session"),
                psychologist("Ms. Aarthi Balan", "M.Phil. Clinical Psychology",
                        "Adolescent counselling, Academic stress", "ta,en", "Madurai",
                        "Tamil Nadu", 7, "4.6", "Rs 500 per session for students"),
                psychologist("Dr. Nithya Gopal", "M.D. Psychiatry",
                        "Depression, Anxiety", "kn,en,ta", "Bengaluru", "Karnataka", 11, "4.7",
                        "Rs 1,500 per consultation"),
                psychologist("Ms. Radhika Nair", "M.Sc. Counselling Psychology",
                        "Relationship difficulty, Emotional abuse", "ml,en", "Kozhikode",
                        "Kerala", 8, "4.5", "Rs 800 per session"),
                psychologist("Dr. Vaishnavi Suresh", "M.Phil. Clinical Psychology",
                        "Trauma, Sleep difficulty", "ta,en,hi", "Chennai", "Tamil Nadu",
                        9, "4.6", "Rs 900 per session")
        ).forEach(professionalRepository::save);

        log.info("Seeded 20 DEMO professional profiles (all fictional).");
    }

    private Professional lawyer(String name, String qualification, String practiceAreas,
                                String languages, String city, String state, int experience,
                                String rating, boolean legalAid, String fee) {
        return Professional.builder()
                .kind(Professional.Kind.LAWYER)
                .fullName(name)
                .qualification(qualification)
                .registrationInfo("Registration details not verified in this prototype")
                .practiceAreas(practiceAreas)
                .languages(languages)
                .city(city)
                .state(state)
                .yearsExperience(experience)
                .rating(new BigDecimal(rating))
                .reviewCount(experience * 3)
                .acceptsLegalAid(legalAid)
                .consultationFeeInfo(fee)
                .verified(false)
                .isDemo(true)
                .bio("Fictional profile created to demonstrate the directory. "
                   + "Not a real practitioner.")
                .build();
    }

    private Professional psychologist(String name, String qualification, String specialisations,
                                      String languages, String city, String state,
                                      int experience, String rating, String fee) {
        return Professional.builder()
                .kind(Professional.Kind.PSYCHOLOGIST)
                .fullName(name)
                .qualification(qualification)
                .registrationInfo("Registration details not verified in this prototype")
                .specialisations(specialisations)
                .languages(languages)
                .city(city)
                .state(state)
                .yearsExperience(experience)
                .rating(new BigDecimal(rating))
                .reviewCount(experience * 2)
                .consultationFeeInfo(fee)
                .verified(false)
                .isDemo(true)
                .bio("Fictional profile created to demonstrate the directory. "
                   + "Not a real practitioner.")
                .build();
    }

    @Transactional
    void seedLegalResources() {
        if (legalRepository.count() > 0) {
            return;
        }

        List.of(
                legal("Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act",
                        "2013",
                        "Requires employers to prevent and address sexual harassment at work, and to "
                      + "constitute an Internal Committee where ten or more people are employed.",
                        "If you are being harassed at work, your employer has a legal duty to have a "
                      + "process for dealing with it. You can raise a written complaint with the "
                      + "Internal Committee. Where there is no such committee, a Local Committee at "
                      + "district level exists for that purpose.",
                        "Unwelcome physical contact, requests for sexual favours, sexually coloured "
                      + "remarks, showing pornography, and other unwelcome conduct of a sexual nature.",
                        "Write down what happened and when. Keep any messages. Find out whether your "
                      + "workplace has an Internal Committee. A lawyer can help you draft a complaint.",
                        "WORKPLACE_SEXUAL_HARASSMENT,WORKPLACE_POWER_ABUSE,WORKPLACE_BOUNDARY_VIOLATION",
                        "https://www.indiacode.nic.in/handle/123456789/2104",
                        "India Code, Ministry of Law and Justice"),

                legal("Protection of Women from Domestic Violence Act", "2005",
                        "Provides civil remedies for women facing violence in a domestic relationship, "
                      + "including protection orders, residence orders and monetary relief.",
                        "This law recognises that abuse is not only physical. Emotional, sexual, verbal "
                      + "and economic abuse are covered. You can seek an order to stop the abuse and, "
                      + "importantly, an order that you cannot be forced out of the shared household.",
                        "Physical, sexual, verbal, emotional and economic abuse by a spouse, partner or "
                      + "family member in a shared household.",
                        "A Protection Officer in your district can help you file an application. "
                      + "A lawyer or a legal aid clinic can guide you through it.",
                        "DOMESTIC_VIOLENCE,DOMESTIC_EMOTIONAL_ABUSE,DOMESTIC_FINANCIAL_ABUSE,DOMESTIC_IN_LAWS_ABUSE",
                        "https://www.indiacode.nic.in/handle/123456789/2021",
                        "India Code, Ministry of Law and Justice"),

                legal("Dowry Prohibition Act", "1961",
                        "Prohibits the giving or taking of dowry, and penalises demanding dowry.",
                        "Demanding money, gold or goods from you or your family in connection with "
                      + "marriage is an offence, whether the demand comes before the wedding or years "
                      + "afterwards.",
                        "Demands for money, property or valuable security made in connection with "
                      + "marriage.",
                        "Keep a record of the demands, including dates and who made them. Legal advice "
                      + "will help you understand which route fits your situation.",
                        "DOMESTIC_DOWRY,DOMESTIC_IN_LAWS_ABUSE",
                        "https://www.indiacode.nic.in/handle/123456789/1516",
                        "India Code, Ministry of Law and Justice"),

                legal("Legal Services Authorities Act", "1987 — Section 12",
                        "Sets out who is entitled to free legal services from Legal Services "
                      + "Authorities.",
                        "Free legal aid exists as a statutory entitlement for certain categories of "
                      + "people, and women are named among them. Whether and how it applies to your "
                      + "situation is something a District Legal Services Authority can tell you "
                      + "directly, at no cost.",
                        "Representation, legal advice and assistance with drafting, provided without "
                      + "fee to those entitled.",
                        "Contact your District Legal Services Authority. The National Legal Services "
                      + "Authority website lists them by state.",
                        "EDUCATION_FINANCIAL_DIFFICULTY,DOMESTIC_VIOLENCE,WORKPLACE_SEXUAL_HARASSMENT,OTHER",
                        "https://nalsa.gov.in/",
                        "National Legal Services Authority"),

                legal("Bharatiya Nyaya Sanhita", "2023 — provisions on stalking",
                        "Criminal provisions addressing following a woman, contacting her repeatedly "
                      + "against her wishes, or monitoring her use of the internet.",
                        "Repeatedly following you, or contacting you after you have made clear you do "
                      + "not want contact, is treated as an offence rather than a nuisance.",
                        "Following, repeated unwanted contact, and monitoring of electronic "
                      + "communication.",
                        "Note dates, times and places. Preserve messages and call logs. A lawyer can "
                      + "advise on what to do with that record.",
                        "PUBLIC_STALKING,PUBLIC_HARASSMENT",
                        "https://www.indiacode.nic.in/handle/123456789/20062",
                        "India Code, Ministry of Law and Justice"),

                legal("Information Technology Act", "2000 — Section 66E and related provisions",
                        "Addresses violation of privacy through capturing or publishing images of a "
                      + "person's private area without consent, and related electronic offences.",
                        "Sharing or threatening to share private images without your consent is "
                      + "addressed by law. You do not have to accept it as the price of having been "
                      + "in a relationship with someone.",
                        "Capturing, publishing or transmitting private images without consent.",
                        "Preserve the evidence rather than deleting it. Cyber crime cells exist in "
                      + "most states and complaints can be filed online.",
                        "PUBLIC_HARASSMENT,PUBLIC_STALKING,DOMESTIC_EMOTIONAL_ABUSE",
                        "https://www.indiacode.nic.in/handle/123456789/1999",
                        "India Code, Ministry of Law and Justice")
        ).forEach(legalRepository::save);

        log.warn("Seeded {} legal resources. Every row is marked as requiring verification "
               + "before real use.", legalRepository.count());
    }

    private LegalResource legal(String lawName, String section, String description,
                                String plainLanguage, String covers, String nextSteps,
                                String categories, String sourceUrl, String sourceName) {
        return LegalResource.builder()
                .lawName(lawName)
                .section(section)
                .jurisdiction("India")
                .description(description)
                .plainLanguageExplanation(plainLanguage)
                .whatItMayCover(covers)
                .possibleNextSteps(nextSteps)
                .issueCategories(categories)
                .sourceUrl(sourceUrl)
                .sourceName(sourceName)
                .lastVerifiedAt(LocalDate.of(2026, 8, 8))
                .verifiedBy(VERIFIER)
                .active(true)
                .build();
    }

    @Transactional
    void seedLegalCases() {
        if (legalCaseRepository.count() > 0) {
            return;
        }
        // Deliberately sparse. Inventing case names, courts and holdings would be
        // exactly the failure this module exists to prevent, so the seed ships a
        // single explanatory row and the real ones are added by a person.
        legalCaseRepository.save(LegalCaseSummary.builder()
                .caseName("No verified case summaries have been added yet")
                .court("—")
                .year(2026)
                .summary("Case summaries are added by a person who has read the judgment and "
                       + "recorded where it can be found. None have been added to this "
                       + "prototype, because inventing them would undermine the one thing "
                       + "this module is for.")
                .issueCategory("OTHER")
                .outcome("—")
                .sourceUrl("https://main.sci.gov.in/judgments")
                .verifiedAt(LocalDate.of(2026, 8, 8))
                .active(true)
                .build());
    }

    @Transactional
    void seedCommunityPosts() {
        if (postRepository.count() > 0) {
            return;
        }
        record Post(String title, String content, String category) {}

        List.of(
                new Post("Writing things down helped more than I expected",
                        "For months I could not explain what was happening because it sounded small "
                      + "each time. Keeping a note with dates changed that. When I finally spoke to "
                      + "someone, I had something to point at instead of trying to remember.",
                        "WORKPLACE"),
                new Post("The internal committee at my office actually existed",
                        "I assumed it was on paper only. It was not. It took a long time and it was "
                      + "not pleasant, but it was a real process and I was not the one who had to "
                      + "prove I deserved to be heard.", "WORKPLACE"),
                new Post("Asking my sister to keep a bag at her house",
                        "Not because I was leaving. Because knowing I could made the days I stayed "
                      + "feel less trapped.", "DOMESTIC"),
                new Post("Free legal aid was real in my district",
                        "I did not think it would be. I went in expecting to be turned away. I was "
                      + "not asked for money at any point.", "LEGAL"),
                new Post("Telling one person",
                        "I told one friend after two years. She did not fix anything. It still "
                      + "changed how heavy it was to carry.", "SUPPORT"),
                new Post("Screenshots with the date visible",
                        "Someone told me to make sure the date and time were in the picture, not just "
                      + "the message. That detail mattered later.", "WORKPLACE"),
                new Post("My college had a scholarship nobody mentioned",
                        "I nearly dropped out over fees. The office had a fund that was not on the "
                      + "website. Ask, even when you think the answer is no.", "EDUCATION"),
                new Post("Therapy did not mean something was wrong with me",
                        "I put it off because going felt like admitting I had broken. It was closer "
                      + "to putting down something I had been holding for a long time.",
                        "PSYCHOLOGICAL")
        ).forEach(post -> postRepository.save(CommunityPost.builder()
                .anonymous(true)
                .title(post.title())
                .content(post.content())
                .category(post.category())
                .moderationStatus(CommunityPost.ModerationStatus.APPROVED)
                .helpfulCount(3 + post.title().length() % 20)
                .build()));

        log.info("Seeded {} community posts.", postRepository.count());
    }
}
