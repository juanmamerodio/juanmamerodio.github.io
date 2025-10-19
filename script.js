
    function toggleCardContent(cardElement, contentId) {
        const content = document.getElementById(contentId);
        const isActive = cardElement.classList.contains('active');

        // 1. Selecciona TODAS las tarjetas que estén 'activas'
        const allActiveCards = document.querySelectorAll('.module-card.active');

        // 2. Cierra todas las tarjetas activas, *excepto* la que acabamos de clickear
        allActiveCards.forEach(activeCard => {
            if (activeCard !== cardElement) {
                activeCard.classList.remove('active');
                // Asumimos que el contenido a ocultar es el último hijo
                const activeContent = activeCard.querySelector('.card-content-dropdown');
                if (activeContent) {
                    activeContent.style.marginTop = '0px';
                }
            }
        });

        // 3. Abre o cierra la tarjeta actual
        if (isActive) {
            // Si ya estaba activa, la cierra
            cardElement.classList.remove('active');
            content.style.marginTop = '0px';
        } else {
            // Si estaba cerrada, la activa
            cardElement.classList.add('active');
            // Este margin-top es opcional, pero le da un respiro al texto
            content.style.marginTop = '1rem'; 
        }
    }

    // Opcional: Asegurarse de que todo esté cerrado al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
         const allCards = document.querySelectorAll('.module-card');
         allCards.forEach(card => {
            card.classList.remove('active');
            const content = card.querySelector('.card-content-dropdown');
            if (content) {
                content.style.marginTop = '0px';
            }
         });
    });



        // === TU CÓDIGO JS INTEGRADO (INICIO) ===

        document.addEventListener('DOMContentLoaded', () => {
            // Nota: Se requiere la librería 'feather-icons' para 'feather.replace()'
            // Ya que no está en el HTML, la comento para evitar errores.
            // feather.replace(); 

            // Animaciones de scroll
            const revealElements = document.querySelectorAll('.reveal');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Nota: La clase 'reveal-visible' debe tener estilos definidos en CSS para mostrar la animación.
                        entry.target.classList.add('reveal-visible'); 
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            revealElements.forEach(el => observer.observe(el));

            // Acordeón (Este código es redundante para las tarjetas de módulos, pero se mantiene si lo usas en otro lugar)
            const accordionContainers = document.querySelectorAll('.accordion-container');
            accordionContainers.forEach(container => {
                container.addEventListener('click', (e) => {
                    const header = e.target.closest('.accordion-item-header');
                    if (!header) return;

                    const accordionItem = header.parentElement;
                    const wasActive = accordionItem.classList.contains('active');
                    
                    container.querySelectorAll('.accordion-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    if (!wasActive) {
                        accordionItem.classList.add('active');
                    }
                });
            });

            // === FORMULARIO ===
            const qualifyForm = document.getElementById('qualify-form');
            // Nota: Verifica que este formulario esté presente en el HTML para que funcione.
            if (!qualifyForm) return; 

            const submitButton = document.getElementById('submit-button');
            const formError = document.getElementById('form-error');
            const formSuccess = document.getElementById('form-success');

            // ⚠️ PEGA AQUÍ LA URL DE TU APPS SCRIPT (termina en /exec)
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxaLMCCrIjieASrod1YSdCBwyLfublnP-I_ld_k0gc2iyBbVAG002bL-WkzS9TF6cI/exec';
            
            const notionURL = 'https://www.notion.so/Preview-Ascender-28dcacf97f838076a5d7c29822f9d4fe?source=copy_link';

            qualifyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Verificar configuración
                if (scriptURL.includes('TU_DEPLOYMENT_ID')) {
                    // Sustituido alert() por console.error() para cumplir con las restricciones del entorno
                    console.error('⚠️ Error de configuración: Actualiza la URL del script en script.js'); 
                    return;
                }

                formError.classList.add('hidden');

                // Validación
                let isValid = true;
                qualifyForm.querySelectorAll('[required]').forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = '#EF4444';
                    } else {
                        field.style.borderColor = '#D1D5DB';
                    }
                });

                if (!isValid) {
                    formError.textContent = 'Por favor, completa todos los campos.';
                    formError.classList.remove('hidden');
                    return;
                }

                // Botón de carga
                const originalHTML = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                `;

                // Enviar con FormData (evita preflight CORS)
                const formData = new FormData(qualifyForm);
                
                console.log('Enviando datos...');

                fetch(scriptURL, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Respuesta:', data);
                    
                    if (data.result === 'success') {
                        // Éxito
                        qualifyForm.style.display = 'none';
                        formSuccess.classList.remove('hidden');
                        formSuccess.innerHTML = `¡Gracias! Tus datos se guardaron correctamente. ID: ${data.id || 'N/A'}<br> Abriendo Notion...`;
                        
                        setTimeout(() => {
                            window.location.href = notionURL;
                        }, 2000);
                        
                    } else {
                        throw new Error(data.message || 'Error desconocido en la respuesta del script.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalHTML;
                    
                    formError.textContent = `Error: ${error.message}. Verifica la consola (F12) para más detalles.`;
                    formError.classList.remove('hidden');
                });
            });
        });