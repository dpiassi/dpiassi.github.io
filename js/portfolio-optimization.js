/**
 * Portfolio Modal Performance Optimizations
 * Optimizes the project modal loading to reduce delays and improve user experience
 */

$(document).ready(function () {
  // Optimization 1: Preload critical modal structure and improve transition performance
  var $portfolioModals = $(".portfolio-modal");

  // Add GPU acceleration to modals for smoother animations
  $portfolioModals.css({
    transform: "translateZ(0)",
    "-webkit-transform": "translateZ(0)",
  });

  // Optimization 2: Lazy loading for modal content
  var lazyLoadModalContent = function ($modal) {
    // Load images lazily when modal opens
    $modal.find("img[data-src]").each(function () {
      var $img = $(this);
      var src = $img.data("src");
      if (src && !$img.attr("src")) {
        $img.attr("src", src).removeAttr("data-src");
      }
    });

    // Load iframes lazily when modal opens (except first carousel item)
    $modal.find("iframe[data-src]").each(function () {
      var $iframe = $(this);
      var src = $iframe.data("src");
      if (src && !$iframe.attr("src")) {
        $iframe.attr("src", src).removeAttr("data-src");
      }
    });
  };

  // Optimization 3: Fast modal opening with event delegation
  $(".portfolio-link").on("click", function (e) {
    e.preventDefault();

    // Get the target modal
    var modalId = $(this).attr("href");
    var $targetModal = $(modalId);

    if ($targetModal.length) {
      // Preload content immediately on click for faster opening
      lazyLoadModalContent($targetModal);

      // Show modal with slight delay to allow content loading
      setTimeout(function () {
        $targetModal.modal("show");
      }, 50);
    }
  });

  // Optimization 4: Efficient modal event handling
  $portfolioModals.on("show.bs.modal", function () {
    var $modal = $(this);

    // Ensure all content is loaded when modal shows
    lazyLoadModalContent($modal);

    // Force browser reflow to prevent animation glitches
    $modal[0].offsetHeight;
  });

  // Optimization 5: Clean up resources when modal closes
  $portfolioModals.on("hidden.bs.modal", function () {
    var $modal = $(this);

    // Stop YouTube videos to prevent background playback
    $modal.find('iframe[src*="youtube.com"]').each(function () {
      var src = $(this).attr("src");
      if (src) {
        // Pause video by reloading iframe
        $(this).attr("src", "");
        // Restore src after a brief delay to maintain lazy loading capability
        setTimeout(() => {
          $(this).attr("data-src", src);
        }, 100);
      }
    });
  });

  // Optimization 6: Preload first image of each carousel for faster modal opening
  setTimeout(function () {
    $(".portfolio-modal .carousel .item:first-child img[data-src]").each(
      function () {
        var $img = $(this);
        var src = $img.data("src");
        if (src) {
          $img.attr("src", src).removeAttr("data-src");
        }
      }
    );
  }, 1000); // Delay to not interfere with initial page load

  // Optimization 7: Add loading indicators for better UX
  $(".portfolio-link").on("click", function () {
    var $link = $(this);
    var $caption = $link.find(".caption-content");
    var originalContent = $caption.html();

    // Show loading spinner
    $caption.html('<i class="fa fa-spinner fa-spin fa-3x"></i>');

    // Restore original content after modal opens
    setTimeout(function () {
      $caption.html(originalContent);
    }, 500);
  });

  console.log("Portfolio optimization loaded - Modal performance enhanced");
});
