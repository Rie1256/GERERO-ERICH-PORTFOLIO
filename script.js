/* =====================================================
   STUDENT PORTFOLIO - script.js
   Each part below does one job. Read the comments!

   SAFETY: every part runs inside safely(...). If one part has
   a problem, the other parts still work, and your content never
   stays hidden.
   ===================================================== */

(function () {

    // Tell the CSS that JavaScript is working (the scroll animation and mobile menu need it).
    // If this file fails to load, this line never runs, so all sections stay visible.
    document.documentElement.classList.add('js-ready');

    // Runs a part of the code and shows a clear message in the Console (F12) if it breaks
    function safely(name, task) {
        try {
            task();
        } catch (error) {
            console.error('Portfolio: the part "' + name + '" has a problem:', error);
        }
    }

    function onReady(task) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', task);
        } else {
            task();
        }
    }

    onReady(function () {

        /* ---------- TOAST MESSAGE (small box at the bottom) ---------- */
        var toast = document.getElementById('toast');
        var toastTimer;

        function showToast(text, seconds) {
            if (!toast) { return; }
            toast.textContent = text;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function () { toast.classList.remove('show'); }, (seconds || 3.5) * 1000);
        }

        /* ---------- 1. FOOTER YEAR ---------- */
        safely('footer year', function () {
            var yearSpan = document.getElementById('year');
            if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }
        });

        /* ---------- 2. MOBILE MENU ---------- */
        safely('mobile menu', function () {
            var navToggle = document.getElementById('navToggle');
            var navMenu = document.getElementById('navMenu');
            if (!navToggle || !navMenu) { return; }

            function closeMenu() {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open menu');
            }

            navToggle.addEventListener('click', function () {
                var isOpen = navMenu.classList.toggle('open');
                navToggle.setAttribute('aria-expanded', String(isOpen));
                navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            });

            // Close the menu after clicking a link
            navMenu.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', closeMenu);
            });
        });

        /* ---------- 3. MISSING IMAGE FALLBACK ----------
           If an image file is not found, show a readable box instead. */
        safely('image fallback', function () {
            function showPlaceholder(img) {
                var box = document.createElement('div');
                box.className = 'img-placeholder';
                box.setAttribute('role', 'img');
                box.setAttribute('aria-label', img.alt);
                box.textContent = img.dataset.placeholder || 'Image not found';
                img.replaceWith(box);
            }

            document.querySelectorAll('img[data-placeholder]').forEach(function (img) {
                // The image may already have failed before this code ran
                if (img.complete && img.naturalWidth === 0) {
                    showPlaceholder(img);
                } else {
                    img.addEventListener('error', function () { showPlaceholder(img); });
                }
            });
        });

        /* ---------- 4. PLACEHOLDER LINKS ----------
           Links with class "is-placeholder" do not go anywhere yet.
           Clicking one tells the visitor (and you) to add a real link. */
        safely('placeholder links', function () {
            document.querySelectorAll('a.is-placeholder').forEach(function (link) {
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    showToast('This link is a placeholder. Open index.html and add your real link.');
                });
            });
        });

        /* ---------- 5. IMAGE PREVIEW (MODAL) ---------- */
        safely('image preview', function () {
            var modal = document.getElementById('imageModal');
            var modalImage = document.getElementById('modalImage');
            var modalCaption = document.getElementById('modalCaption');
            var modalMissing = document.getElementById('modalMissing');
            var modalClose = document.getElementById('modalClose');
            var lastFocused = null;
            if (!modal || !modalImage) { return; }

            function openModal(src, caption) {
                lastFocused = document.activeElement;
                modalMissing.hidden = true;
                modalImage.hidden = false;
                modalImage.alt = caption;
                modalImage.src = src;
                modalCaption.textContent = caption;
                modal.hidden = false;
                document.body.style.overflow = 'hidden';
                modalClose.focus();
            }

            function closeModal() {
                modal.hidden = true;
                modalImage.removeAttribute('src');
                document.body.style.overflow = '';
                if (lastFocused) { lastFocused.focus(); }
            }

            // If the big image is missing, show a friendly message
            modalImage.addEventListener('error', function () {
                if (modalImage.getAttribute('src')) {
                    modalImage.hidden = true;
                    modalMissing.hidden = false;
                }
            });

            document.querySelectorAll('.cert-thumb').forEach(function (button) {
                button.addEventListener('click', function () {
                    openModal(button.dataset.full, button.dataset.caption || 'Certificate');
                });
            });

            modalClose.addEventListener('click', closeModal);
            // Click on the dark background closes it too
            modal.addEventListener('click', function (event) {
                if (event.target === modal) { closeModal(); }
            });
            // Press Esc to close
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && !modal.hidden) { closeModal(); }
            });
        });

        /* ---------- 7. MENU: HOVER, ACTIVE LINK AND CLICK FEEDBACK ----------
           - Hover: a small label shows what the menu button does (from data-tip).
           - Active: the menu button of the section you are looking at is highlighted.
           - Click: the menu button lights up, the section title flashes,
             and a message says "Now viewing: ...". */
        var navLinks = document.querySelectorAll('.nav-link');
        var menuLockUntil = 0; // while scrolling after a click, do not let the scroll change the highlight

        function setActiveLink(id) {
            navLinks.forEach(function (link) {
                var isActive = link.getAttribute('href') === '#' + id;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        safely('active menu link', function () {
            var sections = document.querySelectorAll('main section[id]');
            if (!('IntersectionObserver' in window)) { return; }

            var sectionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && Date.now() > menuLockUntil) {
                        setActiveLink(entry.target.id);
                    }
                });
            }, { rootMargin: '-45% 0px -50% 0px' });

            sections.forEach(function (section) { sectionObserver.observe(section); });
        });

        /* ---------- 8. BACK TO TOP BUTTON (and "Contact" at the very bottom) ---------- */
        safely('back to top', function () {
            var backToTop = document.getElementById('backToTop');
            if (!backToTop) { return; }

            window.addEventListener('scroll', function () {
                backToTop.classList.toggle('show', window.scrollY > 500);

                // The Contact section is short, so highlight it when the page reaches the bottom
                var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
                if (atBottom && Date.now() > menuLockUntil) { setActiveLink('contact'); }
            }, { passive: true });

            backToTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'auto' });
            });
        });

        /* ---------- 9. CONTACT FORM VALIDATION ----------
           NOTE: This form does NOT send messages by itself, because a website
           with only HTML/CSS/JS has no server (backend).
           After the fields are valid, we make an email link so the visitor can
           send the message using their own email app.
           To really send messages, see "Connect the form later" in GUIDE.md. */
        safely('contact form', function () {
            var form = document.getElementById('contactForm');
            var formStatus = document.getElementById('formStatus');
            var nameInput = document.getElementById('name');
            var emailInput = document.getElementById('email');
            var messageInput = document.getElementById('message');
            if (!form) { return; }

            form.noValidate = true; // we show our own messages instead of the browser's

            function setError(input, errorId, text) {
                document.getElementById(errorId).textContent = text;
                input.classList.toggle('invalid', text !== '');
                input.setAttribute('aria-invalid', text !== '' ? 'true' : 'false');
            }

            function validateForm() {
                var valid = true;
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (nameInput.value.trim() === '') {
                    setError(nameInput, 'nameError', 'Please enter your name.');
                    valid = false;
                } else {
                    setError(nameInput, 'nameError', '');
                }

                if (emailInput.value.trim() === '') {
                    setError(emailInput, 'emailError', 'Please enter your email address.');
                    valid = false;
                } else if (!emailPattern.test(emailInput.value.trim())) {
                    setError(emailInput, 'emailError', 'Please enter a valid email, like name@example.com.');
                    valid = false;
                } else {
                    setError(emailInput, 'emailError', '');
                }

                if (messageInput.value.trim().length < 10) {
                    setError(messageInput, 'messageError', 'Please write a message (at least 10 characters).');
                    valid = false;
                } else {
                    setError(messageInput, 'messageError', '');
                }

                return valid;
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                formStatus.className = 'form-status';
                formStatus.innerHTML = '';

                if (!validateForm()) {
                    formStatus.className = 'form-status fail';
                    formStatus.textContent = 'Please fix the problems above and try again.';
                    return;
                }

                // Build an email link using the address written in the Contact section
                var myEmail = document.getElementById('myEmail').getAttribute('href').replace('mailto:', '');
                var subject = encodeURIComponent('Portfolio message from ' + nameInput.value.trim());
                var body = encodeURIComponent(messageInput.value.trim() + '\n\nFrom: ' + nameInput.value.trim() + ' (' + emailInput.value.trim() + ')');
                var mailLink = 'mailto:' + myEmail + '?subject=' + subject + '&body=' + body;

                formStatus.className = 'form-status success';
                formStatus.innerHTML =
                    'Thank you! Your message looks good. This website has no server yet, so the message was <strong>not sent automatically</strong>. ' +
                    '<a href="' + mailLink + '">Click here to send it with your email app</a>.';
            });

            // Remove the red error as soon as the visitor fixes a field
            [nameInput, emailInput, messageInput].forEach(function (input) {
                input.addEventListener('input', function () {
                    if (input.classList.contains('invalid')) { validateForm(); }
                });
            });
        });

            });

})();