// Debug logs removed. Production-ready: no console debug output.

// Global translation function
function _t(keyName, defaultEn) {
  try {
    var lang =
      typeof window.currentLang !== "undefined" ? window.currentLang : "en";
    if (
      lang === "pt-br" &&
      window.I18N &&
      window.I18N["pt-br"] &&
      window.I18N["pt-br"].js &&
      window.I18N["pt-br"].js[keyName]
    ) {
      return window.I18N["pt-br"].js[keyName];
    }
    if (
      window.I18N &&
      window.I18N.en &&
      window.I18N.en.js &&
      window.I18N.en.js[keyName]
    ) {
      return window.I18N.en.js[keyName];
    }
  } catch (e) {
    console.warn("Translation lookup failed for key:", keyName, e);
  }
  return defaultEn || "";
}

$(function () {
  $("input,textarea,select").jqBootstrapValidation({
    preventSubmit: true,
    submitError: function ($form, event, errors) {
      // additional error messages or events
    },
    submitSuccess: function ($form, event) {
      event.preventDefault(); // prevent default submit behaviour
      // get values from FORM
      var name = $("input#name").val();
      var email = $("input#email").val();
      var company = $("input#company").val();
      var projectType = $("select#projectType").val();
      var message = $("textarea#message").val();
      var firstName = name; // For Reply-To email

      // Check for white space in name for Success/Fail message
      if (firstName.indexOf(" ") >= 0) {
        firstName = name.split(" ").slice(0, -1).join(" ");
      }

      // Prepare Formspree endpoint. Replace YOUR_FORM_ID with your form ID.
      var FORMSPREE_ENDPOINT = "https://formspree.io/f/xwprkddy";

      // Honeypot check: if the hidden '_gotcha' field has a value, treat as spam.
      var honeypot = $("input[name='_gotcha']").val();
      if (honeypot) {
        console.warn("Honeypot triggered — dropping submission.");
        // To avoid revealing bot detection, show the normal success message.

        var fakeTitle = _t(
          "honeypot_title",
          "<strong>Your message has been sent.</strong>"
        );
        var fakeBody = _t("honeypot_body", " We'll get back to you soon.");
        $("#success").html("<div class='alert alert-success'>");
        $("#success > .alert-success").html(
          "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
        );
        $("#success > .alert-success").append(fakeTitle + fakeBody);
        $("#success > .alert-success").append("</div>");
        $("#contactForm").trigger("reset");
        return;
      }

      // Show a temporary sending message
      var sendingMsg = _t("sending", "<strong>Sending...</strong>");
      $("#success").html("<div class='alert alert-info'>");
      $("#success > .alert-info").html(
        "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
      );
      $("#success > .alert-info").append(sendingMsg);
      $("#success > .alert-info").append("</div>");

      // If the page is opened via file://, AJAX requests will fail — inform the user.
      if (window.location && window.location.protocol === "file:") {
        $("#success").html("<div class='alert alert-danger'>");
        $("#success > .alert-danger").html(
          "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
        );
        $("#success > .alert-danger").append(
          _t(
            "file_protocol_error",
            "<strong>Error: open this site via a local server (http) to test the form).</strong>"
          )
        );
        $("#success > .alert-danger").append("</div>");
        return;
      }

      // Helper: send to Formspree, optionally with a reCAPTCHA token
      function sendToFormspree(recaptchaToken) {
        var payload = {
          name: name,
          email: email,
          company: company,
          projectType: projectType,
          message: message,
          _replyto: email,
        };
        if (recaptchaToken) payload["g-recaptcha-response"] = recaptchaToken;

        $.ajax({
          url: FORMSPREE_ENDPOINT,
          method: "POST",
          data: payload,
          dataType: "json",
          headers: { Accept: "application/json" },
          success: function (data, textStatus, jqXHR) {
            console.info("Formspree success", textStatus, jqXHR, data);
            var successTitle = _t(
              "success_title",
              "<strong>Your message has been sent.</strong>"
            );
            var successBody = _t(
              "success_body",
              " We'll get back to you soon."
            );
            $("#success").html("<div class='alert alert-success'>");
            $("#success > .alert-success").html(
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
            );
            $("#success > .alert-success").append(successTitle + successBody);
            $("#success > .alert-success").append("</div>");

            // Clear all fields
            $("#contactForm").trigger("reset");
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.error("Formspree error", textStatus, errorThrown, jqXHR);
            var failTitle = _t(
              "fail_title",
              "<strong>Sorry, it looks like something went wrong.</strong>"
            );
            var failBody = _t("fail_body", " Please try again later.");
            $("#success").html("<div class='alert alert-danger'>");
            $("#success > .alert-danger").html(
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
            );
            $("#success > .alert-danger").append(failTitle + failBody);
            $("#success > .alert-danger").append("</div>");

            // Clear all fields
            $("#contactForm").trigger("reset");
          },
        });
      }

      // If a reCAPTCHA v3 site key is provided via the layout, obtain a token and include it.
      if (
        window.FORMSPREE_RECAPTCHA_SITEKEY &&
        window.FORMSPREE_RECAPTCHA_SITEKEY.length
      ) {
        var siteKey = window.FORMSPREE_RECAPTCHA_SITEKEY;
        function doExecute() {
          if (window.grecaptcha && grecaptcha.execute) {
            grecaptcha.ready(function () {
              try {
                grecaptcha
                  .execute(siteKey, { action: "contact" })
                  .then(function (token) {
                    sendToFormspree(token);
                  })
                  .catch(function (err) {
                    console.error("reCAPTCHA execute error", err);
                    // Fallback: send without token
                    sendToFormspree();
                  });
              } catch (e) {
                console.error("reCAPTCHA error", e);
                sendToFormspree();
              }
            });
          } else {
            // Load grecaptcha script dynamically and retry
            var script = document.createElement("script");
            script.src =
              "https://www.google.com/recaptcha/api.js?render=" + siteKey;
            script.async = true;
            script.defer = true;
            script.onload = function () {
              doExecute();
            };
            script.onerror = function () {
              console.error("Failed to load reCAPTCHA script");
              sendToFormspree();
            };
            document.head.appendChild(script);
          }
        }

        doExecute();
      } else {
        // No reCAPTCHA configured — send directly
        sendToFormspree();
      }
    },
    filter: function () {
      return $(this).is(":visible");
    },
  });

  $('a[data-toggle="tab"]').click(function (e) {
    e.preventDefault();
    $(this).tab("show");
  });
});

// When clicking on Full hide fail/success boxes
$("#name").focus(function () {
  $("#success").html("");
});

// Floating label functionality
$(document).ready(function () {
  $("body")
    .on("input propertychange", ".floating-label-form-group", function (e) {
      $(this).toggleClass(
        "floating-label-form-group-with-value",
        !!$(e.target).val()
      );
    })
    .on("focus", ".floating-label-form-group", function () {
      $(this).addClass("floating-label-form-group-with-focus");
    })
    .on("blur", ".floating-label-form-group", function () {
      $(this).removeClass("floating-label-form-group-with-focus");
    });
});
