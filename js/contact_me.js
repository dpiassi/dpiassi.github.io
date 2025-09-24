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

      // Show success message
      $("#success").html("<div class='alert alert-success'>");
      $("#success > .alert-success")
        .html(
          "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
        )
        .append("</button>");
      $("#success > .alert-success").append(
        "<strong>Your message has been sent. </strong>"
      );
      $("#success > .alert-success").append("</div>");

      // Clear all fields
      $("#contactForm").trigger("reset");

      // Note: For a production site, you would want to integrate with a form service
      // like Formspree, Netlify Forms, or a custom backend to actually send the email
      console.log("Form submission details:");
      console.log("Name: " + name);
      console.log("Email: " + email);
      console.log("Company: " + company);
      console.log("Project Type: " + projectType);
      console.log("Message: " + message);
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
