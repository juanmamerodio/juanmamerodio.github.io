document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Feather Icons
    feather.replace();

    // Script para animación al hacer scroll (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Se activa cuando el 10% del elemento es visible
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Script para Acordeón (FAQ y Módulos)
    const accordionContainers = document.querySelectorAll('.accordion-container');

    accordionContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            const header = e.target.closest('.accordion-item-header');
            if (!header) return;

            const accordionItem = header.parentElement;
            const wasActive = accordionItem.classList.contains('active');
            
            // Cerrar todos los items
            container.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Abrir el item clickeado si no estaba activo
            if (!wasActive) {
                accordionItem.classList.add('active');
            }
        });
    });

    // --- LÓGICA DEL FORMULARIO DE CUALIFICACIÓN ---
    // COMENTARIO DE CAMBIO: Se unificó toda la lógica del formulario en un solo bloque.
    // El código anterior tenía dos 'addEventListener' para el mismo evento, lo cual es incorrecto.

    const qualifyForm = document.getElementById('qualify-form');
    const submitButton = document.getElementById('submit-button');
    const formError = document.getElementById('form-error');
    const formSuccess = document.getElementById('form-success');

    // PEGA AQUÍ LA URL DE TU APLICACIÓN WEB DE GOOGLE APPS SCRIPT
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzjaWfxvQklgk2mBi1j9MLsf4hlcGP44uB9Cs_z5H1IKcg8AYi47CxSlmkD7ZBLdn8/exec';

    // URL a la que se redirigirá al usuario tras el éxito
    const notionURL = 'https://www.notion.so/Preview-Ascender-28dcacf97f838076a5d7c29822f9d4fe?source=copy_link';

    qualifyForm.addEventListener('submit', e => {
        e.preventDefault();
        formError.classList.add('hidden'); // Ocultar error previo

        // Validación simple
        let isValid = true;
        const requiredFields = qualifyForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#EF4444'; // Borde rojo
            } else {
                field.style.borderColor = '#D1D5DB'; // Borde gris por defecto
            }
        });

        if (!isValid) {
            formError.textContent = 'Por favor, completa todos los campos requeridos.';
            formError.classList.remove('hidden');
            return;
        }

        // Estado de carga del botón
        const originalButtonHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
        `;

        const formData = new FormData(qualifyForm);
        
        // COMENTARIO DE CAMBIO: Corregido el objeto de datos.
        // Ahora las claves ('instagram', 'business', 'revenue') coinciden exactamente
        // con las que espera recibir el script de Google (Apps Script). Esta es la causa
        // principal por la que los datos no se estaban procesando.
        const data = {
            instagram: formData.get('instagram'),
            business: formData.get('business'),
            revenue: formData.get('revenue'),
        };

        // Enviar datos a Google Apps Script
        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            // COMENTARIO DE CAMBIO: Eliminado 'mode: 'no-cors''.
            // Aunque a veces se usa para evitar problemas de CORS, impide que el navegador
            // vea la respuesta real del servidor. Sin esto, podemos manejar errores y éxitos correctamente.
        })
        .then(response => response.json()) // Esperamos una respuesta JSON del script
        .then(res => {
            if (res.result === 'success') {
                // Éxito: Ocultar formulario, mostrar mensaje y redirigir
                qualifyForm.style.display = 'none';
                formSuccess.style.display = 'block';

                // COMENTARIO DE CAMBIO: La redirección ahora ocurre DESPUÉS de confirmar que los datos se guardaron.
                setTimeout(() => {
                    window.location.href = notionURL;
                }, 1500); // Espera 1.5 segundos para que el usuario vea el mensaje de éxito.

            } else {
                // Si el script de Google devuelve un error, lo mostramos.
                throw new Error(res.message || 'Error desconocido del servidor.');
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            // En caso de error, restaurar el botón y mostrar un mensaje claro.
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonHTML;
            formError.textContent = 'Hubo un error al enviar. Por favor, intenta de nuevo.';
            formError.classList.remove('hidden');
        });
    });
});