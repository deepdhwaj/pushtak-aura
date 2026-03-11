/**
 * Navbar Loader - Fetches shared navbar, injects it, and sets active state based on current URL.
 * Include BEFORE main.js so #mobile-menu exists when mmenu initializes.
 * Place <div id="navbar-placeholder"></div> where navbar should appear.
 */
(function () {
  'use strict';

  var NAVBAR_URL = '/html/partials/navbar.html';

  // Map URL pathname to nav section (data-nav-section). Order matters for prefix matching.
  var PATH_TO_SECTION = [
    { path: '/books-media-gird', section: 'books-media' },
    { path: '/books-media', section: 'books-media' },
    { path: '/news-events-list', section: 'news-events' },
    { path: '/news-events', section: 'news-events' },
    { path: '/blog-grid', section: 'blog' },
  { path: '/blog', section: 'blog' },
    { path: '/post', section: 'blog' },
    { path: '/about', section: 'pages' },
    { path: '/cart', section: 'pages' },
    { path: '/wishlist', section: 'pages' },
    { path: '/checkout', section: 'pages' },
    { path: '/signin', section: 'pages' },
    { path: '/signup', section: 'pages' },
    { path: '/404', section: 'pages' },
    { path: '/upload', section: 'upload' },
    { path: '/contact', section: 'contact' },
    { path: '/', section: 'home' }
  ];

  function getCurrentSection() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    for (var i = 0; i < PATH_TO_SECTION.length; i++) {
      var item = PATH_TO_SECTION[i];
      if (path === item.path || (item.path !== '/' && path.indexOf(item.path) === 0)) {
        return item.section;
      }
    }
    return null;
  }

  function setActiveState(container) {
    var section = getCurrentSection();
    if (!section || !container) return;
    var items = container.querySelectorAll('[data-nav-section]');
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var link = el.querySelector('.nav-link');
      if (el.getAttribute('data-nav-section') === section && link) {
        link.classList.add('active');
      } else if (link) {
        link.classList.remove('active');
      }
    }
  }

  function loadNavbar() {
    var placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', NAVBAR_URL, false);
    xhr.send(null);
    if (xhr.status === 200) {
      placeholder.outerHTML = xhr.responseText;
      var header = document.getElementById('header');
      setActiveState(header);
    }
  }

  loadNavbar();
})();
