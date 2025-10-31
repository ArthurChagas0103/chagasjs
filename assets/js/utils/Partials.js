function updateCurrentYear() {
  try {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  } catch (error) {
    console.error("Erro ao atualizar o ano atual:", error);
  }
}

function isValidEmail(email) {
  try {
    if (!email) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  } catch (error) {
    console.error("Erro ao validar o email:", error);

    return false;
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function inclusionOfJsReferenceInPage(src) {
  try {
    if (!src) {
      return false;
    }

    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = src;

      document.body.appendChild(script);
    }
  } catch (error) {
    return false;
  }
}

function configHeaderAndFooter(srcHeader, srcFooter) {
  const header = document.getElementById("header");
  const footer = document.getElementById("footer");
  let updated = false;

  if (header && header.getAttribute("data-include") !== srcHeader) {
    header.setAttribute("data-include", srcHeader);

    updated = true;
  }
  if (footer && footer.getAttribute("data-include") !== srcFooter) {
    footer.setAttribute("data-include", srcFooter);

    updated = true;
  }
  if (updated) {
    includeHTML().then(() => {
      updateCurrentYear();
      addActiveClass();
    });
  }
}

function removeNavbarAndFooter() {
  document.querySelectorAll("[data-include]").forEach((element) => {
    element.removeAttribute("data-include");

    element.innerHTML = "";
  });
}

function includeHTML() {
  const promises = [];

  document.querySelectorAll("[data-include]").forEach(async (element) => {
    const file = element.getAttribute("data-include");
    const promise = new Promise(async (resolve) => {
      try {
        const res = await fetch(file);
        if (res.ok) {
          const html = await res.text();

          element.innerHTML = html;
        } else {
          element.innerHTML = `<h1><b>Error 404</b></h1>`;
        }
      } catch (err) {
        console.error(err);

        element.innerHTML = `<h1><b>Error 404</b></h1>`;
      }

      resolve();
    });

    promises.push(promise);
  });

  return Promise.all(promises);
}

function addActiveClass() {
  const navLinks = document.querySelectorAll(".nav-link");
  const currentHash = window.location.hash || "#home" || "";

  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  const activeLink = document.querySelector(`.nav-link[href="${currentHash}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash;

    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    const newActiveLink = document.querySelector(
      `.nav-link[href="${newHash}"]`
    );
    if (newActiveLink) {
      newActiveLink.classList.add("active");
    }
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const icon = document.getElementById("sidebarToggleBtnIcon");

  sidebar.classList.toggle("expanded");
  sidebar.classList.toggle("collapsed");
  icon.classList.toggle("bi-list");
  icon.classList.toggle("bi-x");

  closeAllSubmenus();
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const icon = document.getElementById("sidebarToggleBtnIcon");

  sidebar.classList.remove("expanded");
  sidebar.classList.add("collapsed");
  icon.classList.remove("bi-x");
  icon.classList.add("bi-list");
}

function closeAllSubmenus() {
  document
    .querySelectorAll(".has-submenu")
    .forEach((menu) => menu.classList.remove("open"));
  document.querySelectorAll(".arrowSubMenu").forEach((arrow) => {
    arrow.classList.remove("bi-chevron-down");
    arrow.classList.add("bi-chevron-right");
  });
}

function toggleSubmenu(event) {
  event.preventDefault();

  const sidebar = document.getElementById("sidebar");
  const icon = document.getElementById("sidebarToggleBtnIcon");

  if (sidebar.classList.contains("collapsed")) {
    sidebar.classList.remove("collapsed");
    sidebar.classList.add("expanded");
    icon.classList.remove("bi-list");
    icon.classList.add("bi-x");
  }

  const menuItem = event.currentTarget.parentElement;
  const arrowIcon = menuItem.querySelector(".arrowSubMenu");
  const isOpen = menuItem.classList.contains("open");

  closeAllSubmenus();

  if (!isOpen) {
    menuItem.classList.add("open");
    arrowIcon.classList.remove("bi-chevron-right");
    arrowIcon.classList.add("bi-chevron-down");
  }
}

function exitProfile(event) {
  event.preventDefault();

  const account = localStorage.getItem("account");
  if (account) {
    localStorage.removeItem("account");
  }

  window.location.href = "#home";
}

function formatCEP(cep) {
  const cepNumerico = cep.replace(/\D/g, "");
  if (cepNumerico.length >= 5) {
    return cepNumerico.substring(0, 5) + "-" + cepNumerico.substring(5, 8);
  } else {
    return cep;
  }
}

function formatTelefone(telefone) {
  let texto = telefone.replace(/\D/g, "");

  if (texto.length > 0) {
    texto = texto.replace(/^(\d{2})(\d)/, "($1) $2");
  }
  if (texto.length > 9) {
    texto = texto.replace(/(\d)(\d{4})$/, "$1-$2");
  }

  return texto;
}
