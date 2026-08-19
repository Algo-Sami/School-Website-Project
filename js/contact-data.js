/**
 * contact-data.js — Contact Page Centralized Data Configuration
 * Ashraf Islamia Model Public School (AIMPS)
 * CMS-ready data structure for managing school contact info, hours, map, and links.
 */

(function () {
  'use strict';

  const contactData = {
    hero: {
      eyebrow: "GET IN TOUCH",
      heading: "Let's Stay Connected.",
      description: "Whether you're planning your child's next step, seeking information about our school, or simply want to get in touch, we're here to help.",
      image: {
        id: "contact-hero-img",
        url: "assets/images/contact_stay_connected.jpg",
        alt: "Parent and student in a warm consultation with school counselor in a modern, connected school guidance office",
        objectPosition: "center center",
        temporary: false
      }
    },
    office: {
      title: "School Office",
      admissionsTitle: "Admissions Office",
      address: "Near Govt Boys High School, Mirza, Attock, 43600",
      plusCode: "Q9CR+VP, Attock",
      phone: {
        display: "0332 4445969",
        link: "tel:+923324445969",
        whatsapp: "https://wa.me/923324445969"
      },
      email: {
        display: "ashrafislamia67@gmail.com",
        link: "mailto:ashrafislamia67@gmail.com"
      }
    },
    hours: [
      { day: "Monday", time: "8:30 AM – 2:00 PM" },
      { day: "Tuesday", time: "8:00 AM – 2:00 PM" },
      { day: "Wednesday", time: "8:00 AM – 2:00 PM" },
      { day: "Thursday", time: "8:00 AM – 2:00 PM" },
      { day: "Friday", time: "8:00 AM – 12:30 PM" },
      { day: "Saturday", time: "8:00 AM – 2:00 PM" },
      { day: "Sunday", time: "Closed", closed: true }
    ],
    socialLinks: [
      {
        platform: "Facebook",
        url: "https://www.facebook.com/share/1FzfXFNtSC/",
        enabled: true
      },
      {
        platform: "YouTube",
        url: "https://youtube.com/@ashrafislamia1575",
        enabled: true
      }
    ],
    map: {
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.871032890666!2d72.33306877636952!3d33.828551473241515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df814c1d428ab7%3A0x67ee65675e8df761!2sGovt%20Boys%20High%20School%20Mirza!5e0!3m2!1sen!2spk!4v1722350000000!5m2!1sen!2spk",
      title: "Ashraf Islamia Model Public Secondary School Location Map"
    }
  };

  /**
   * Graceful Image Population with Fallback System.
   * If `item.url` is present and valid, appends or updates an `<img>` element.
   * If `item.url` is empty or fails to load, leaves the existing placeholder overlay visual untouched.
   */
  function populateImages() {
    const heroImage = contactData.hero.image;
    if (!heroImage || !heroImage.id || !heroImage.url) return;

    const container = document.getElementById(heroImage.id);
    if (!container) return;

    let img = container.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      container.appendChild(img);
    }
    img.src = heroImage.url;
    img.alt = heroImage.alt || 'School visual';
    img.loading = 'eager';
    img.decoding = 'async';
    if (heroImage.objectPosition) {
      img.style.objectPosition = heroImage.objectPosition;
    }

    // Fallback handling: only display if image loads successfully
    img.onerror = () => {
      img.remove(); // Remove broken image element so CSS placeholder remains visible
    };
  }

  /**
   * Handle the contact form Visual-Only Submission behaviour.
   */
  function initContactForm() {
    const form = document.getElementById('contact-enquiry-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Show inline feedback notice instead of pretending it succeeded
      let statusNotice = document.getElementById('form-status-notice');
      if (!statusNotice) {
        statusNotice = document.createElement('div');
        statusNotice.id = 'form-status-notice';
        statusNotice.className = 'form-status-info';
        form.appendChild(statusNotice);
      }

      statusNotice.textContent = "Message functionality will be connected soon.";
      statusNotice.classList.add('visible');

      // Clear the inputs
      form.reset();

      // Fade out notice after 5 seconds
      setTimeout(() => {
        statusNotice.classList.remove('visible');
      }, 5000);
    });
  }

  function init() {
    populateImages();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export content globally for potential use
  window.AIMPS_ContactData = contactData;
})();
