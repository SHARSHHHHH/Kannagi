package com.kannagi.common.web;

import com.kannagi.common.config.AppProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public branding endpoint. The frontend reads the product name from here so
 * that a rename is a configuration change, not a code change.
 */
@RestController
@RequestMapping("/api/config")
@Tag(name = "Configuration")
public class BrandController {

    private final AppProperties props;

    public BrandController(AppProperties props) {
        this.props = props;
    }

    public record BrandResponse(String name, String displayName, String tagline) {}

    @GetMapping("/brand")
    @Operation(summary = "Product name and tagline for the current deployment")
    public ApiResponse<BrandResponse> brand() {
        AppProperties.Brand b = props.brand();
        return ApiResponse.ok(new BrandResponse(b.name(), b.displayName(), b.tagline()));
    }
}
