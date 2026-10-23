```javascript
/* =========================================
   YOU ARE NOT WHO YOU THINK
   Interactive Editorial Experience
========================================= */

"use strict";

document.documentElement.classList.add("js-ready");


/* 1. MOBILE NAVIGATION */

function initMobileNavigation() {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (!menuButton || !mobileNav) return;

    function closeMenu() {
        mobileNav.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "فتح القائمة");
    }

    function openMenu() {
        mobileNav.hidden = false;
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "إغلاق القائمة");
    }

    closeMenu();

    menuButton.addEventListener("click", () => {
        const isOpen =
            menuButton.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    document.addEventListener("click", (event) => {
        const clickedInsideMenu =
            mobileNav.contains(event.target) ||
            menuButton.contains(event.target);

        if (!clickedInsideMenu) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) {
            closeMenu();
        }
    });
}


/* 2. SMOOTH SCROLLING */

function initSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
                    ? "auto"
                    : "smooth",
                block: "start"
            });

            if (history.replaceState) {
                history.replaceState(null, "", targetId);
            }
        });
    });
}


/* 3. REVEAL SECTIONS ON SCROLL */

function initRevealAnimations() {
    const elements = document.querySelectorAll(
        [
            ".section-heading",
            ".intro-label",
            ".intro-copy",
            ".investigation-card",
            ".article-copy",
            ".article-visual",
            ".reflection-item",
            ".lab-shell",
            ".takeaway-card",
            ".source-item",
            ".closing-content"
        ].join(",")
    );

    if (!elements.length) return;

    elements.forEach((element) => {
        element.classList.add("reveal");
    });

    if (
        !("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        elements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    currentObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    elements.forEach((element, index) => {
        element.style.transitionDelay = `${(index % 4) * 70}ms`;
        observer.observe(element);
    });
}


/* 4. READER LAB */

function initReaderLab() {
    const form = document.querySelector(".lab-form");

    if (!form) return;

    const status = form.querySelector(".form-status");
    const result = form.querySelector(".form-result");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (status) {
            status.textContent = "";
        }

        const formData = new FormData(form);

        const answers = {};

        for (const [key, value] of formData.entries()) {
            answers[key] = String(value).trim();
        }

        const requiredFields = Array.from(
            form.querySelectorAll("[required]")
        );

        const firstEmptyField = requiredFields.find((field) => {
            if (
                field.type === "radio" &&
                field.name
            ) {
                return !form.querySelector(
                    `input[name="${CSS.escape(field.name)}"]:checked`
                );
            }

            return !String(field.value || "").trim();
        });

        if (firstEmptyField) {
            if (status) {
                status.textContent =
                    "كمّلي البيانات المطلوبة الأول، وبعدها اعرضي تأملك.";
            }

            firstEmptyField.focus();
            return;
        }

        const name =
            answers.name ||
            answers.readerName ||
            "قارئنا";

        const selfDescription =
            answers.selfDescription ||
            answers.self ||
            answers.identity ||
            "";

        const behavior =
            answers.behavior ||
            answers.action ||
            answers.realBehavior ||
            "";

        const influence =
            answers.influence ||
            answers.others ||
            answers.socialInfluence ||
            "";

        const reflection =
            answers.reflection ||
            answers.thoughts ||
            answers.note ||
            "";

        const content = buildReflection({
            name,
            selfDescription,
            behavior,
            influence,
            reflection,
            answers
        });

        if (result) {
            const title = result.querySelector("h3");
            const paragraph = result.querySelector("p");

            if (title) {
                title.textContent = `تأملاتك يا ${name}`;
            }

            if (paragraph) {
                paragraph.textContent = content;
            }

            result.hidden = false;
            result.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
                    ? "auto"
                    : "smooth",
                block: "nearest"
            });
        } else {
            window.alert(content);
        }

        if (status) {
            status.textContent =
                "تم إعداد تأملك بناءً على إجاباتك.";
        }
    });
}


/* 5. BUILD THE REFLECTION */

function buildReflection({
    name,
    selfDescription,
    behavior,
    influence,
    reflection,
    answers
}) {
    const paragraphs = [];

    paragraphs.push(
        `بدأت يا ${name} من محاولة فهم الصورة التي تحملها عن نفسك. ` +
        "والخطوة دي في حد ذاتها مهمة؛ لأن فهم الذات مش مجرد وصف بنقوله عن نفسنا، " +
        "لكنه كمان استعداد إننا نراجع الوصف ده."
    );

    if (selfDescription) {
        paragraphs.push(
            `الصورة اللي وصفت بيها نفسك كانت: «${selfDescription}». ` +
            "حاول تلاحظ هل الوصف ده بيعكس مواقف متكررة فعلًا، " +
            "ولا بيعكس الطريقة اللي بتحب تشوف بيها نفسك. " +
            "الاتنين ممكن يتشابهوا، لكن مش شرط يكونوا متطابقين."
        );
    }

    if (behavior) {
        paragraphs.push(
            `أما الموقف أو السلوك اللي ذكرته: «${behavior}»، ` +
            "فهو فرصة تقارن فيها بين نيتك والنتيجة الفعلية لتصرفك. " +
            "موقف واحد مش كفاية للحكم على شخصيتك، لكن ملاحظة السلوك المتكرر " +
            "ممكن تساعدك تفهم نفسك بصورة أدق."
        );
    }

    if (influence) {
        paragraphs.push(
            `وبالنسبة لتأثير الآخرين: «${influence}»، ` +
            "فالسياق الاجتماعي ممكن يؤثر في طريقة تعبيرنا عن آرائنا وتصرفاتنا. " +
            "ده مش معناه إنك بلا شخصية مستقلة، لكنه بيدعوك تلاحظ " +
            "إمتى بتختار عن اقتناع، وإمتى بتتأثر برغبتك في القبول."
        );
    }

    if (reflection) {
        paragraphs.push(
            `وكتبت في تأملك: «${reflection}». ` +
            "احتفظ بالسؤال ده وارجع له بعد ما تلاحظ نفسك في مواقف مختلفة. " +
            "الفهم الأعمق بييجي من المراجعة الهادئة، مش من إصدار حكم نهائي على نفسك."
        );
    }

    paragraphs.push(
        "مهم تفتكر: الهدف مش إنك تكتشف إن صورتك عن نفسك غلط، " +
        "ولا إنك تشك في كل تصرف بتعمله. الهدف إنك تدي نفسك فرصة " +
        "تشوف الصورة كاملة، بما فيها النوايا والسلوك والظروف وتأثير الآخرين."
    );

    return paragraphs.join("\n\n");
}


/* 6. IMAGE FALLBACK */

function initImageFallbacks() {
    const images = document.querySelectorAll("img");

    images.forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("image-unavailable");
            image.setAttribute("aria-label", "تعذر تحميل الصورة");

            const frame = image.closest(".article-image-frame");

            if (frame) {
                frame.classList.add("image-fallback");
            }
        });
    });
}


/* 7. FOOTER YEAR */

function initFooterYear() {
    const yearElements = document.querySelectorAll("[data-current-year]");

    yearElements.forEach((element) => {
        element.textContent = new Date().getFullYear();
    });
}


/* 8. INITIALIZE */

document.addEventListener("DOMContentLoaded", () => {
    initMobileNavigation();
    initSmoothScrolling();
    initRevealAnimations();
    initReaderLab();
    initImageFallbacks();
    initFooterYear();
});
```
