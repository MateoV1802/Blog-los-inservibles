document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    const toggle = document.querySelector('.dropdown-toggle');

    if (toggle && dropdown) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');

            // Toggle active aria state
            const isActive = dropdown.classList.contains('active');
            toggle.setAttribute('aria-expanded', isActive);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown with Escape key for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }
});

// Inicialización del slider de Slick
$(document).ready(function () {
    if ($('.slider').length) {
        $('.slider').slick({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: true,
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: false
                    }
                }
            ]
        });
    }
});

// Lógica para cargar y manejar los posts del blog en Actividades
$(document).ready(function () {
    const postsContainer = $('#posts-container');
    if (postsContainer.length) {
        let allPosts = [];

        // Determinar la ruta al JSON (../posts.json desde subcarpetas, posts.json desde la raíz)
        const jsonPath = window.location.pathname.includes('/partes/') ? '../posts.json' : 'posts.json';

        // Cargar posts
        $.getJSON(jsonPath)
            .done(function (data) {
                allPosts = data;
                renderPosts(allPosts);
                setupFilters();
                setupModal();
            })
            .fail(function () {
                postsContainer.html('<div class="loading-text">Error al cargar las publicaciones. Inténtalo más tarde.</div>');
            });

        // Renderizar posts en la cuadrícula
        function renderPosts(posts) {
            postsContainer.empty();
            if (posts.length === 0) {
                postsContainer.html('<div class="loading-text">No hay publicaciones en esta categoría.</div>');
                return;
            }

            posts.forEach(post => {
                const categoryClass = post.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const postHtml = `
                    <div class="post-card" data-id="${post.id}">
                        <div class="post-img-wrap">
                            <img src="${post.imagen}" alt="${post.titulo}" loading="lazy">
                        </div>
                        <div class="post-body">
                            <div class="post-meta">
                                <span class="post-category ${categoryClass}">${post.categoria}</span>
                                <span class="post-date">${formatDate(post.fecha)}</span>
                            </div>
                            <h3 class="post-title">${post.titulo}</h3>
                            <p class="post-excerpt">${post.contenidoCorto}</p>
                            <div class="post-footer">
                                <span class="post-author">Por: <strong>${post.autor}</strong></span>
                                <span class="post-readmore">Ver más &rarr;</span>
                            </div>
                        </div>
                    </div>
                `;
                postsContainer.append(postHtml);
            });
        }

        // Formatear fecha a formato español
        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('es-ES', options);
        }

        // Configurar filtros por categoría
        function setupFilters() {
            $('.filter-btn').on('click', function () {
                $('.filter-btn').removeClass('active');
                $(this).addClass('active');

                const filterValue = $(this).attr('data-filter');
                if (filterValue === 'todos') {
                    renderPosts(allPosts);
                } else {
                    const filtered = allPosts.filter(post => 
                        post.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
                        filterValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    );
                    renderPosts(filtered);
                }
            });
        }

        // Configurar modal/ventana emergente
        function setupModal() {
            const modal = $('#post-modal');
            const closeBtn = $('.modal-close');
            const mediaContainer = $('#modal-slider-container');

            // Abrir modal al hacer clic en tarjeta de post
            postsContainer.on('click', '.post-card', function () {
                const postId = $(this).data('id');
                const post = allPosts.find(p => p.id === postId);

                if (post) {
                    // Limpiar el contenedor antes de renderizar
                    mediaContainer.empty();

                    // Si tiene imágenes adicionales, creamos un carrusel Slick
                    if (post.imagenesAdicionales && post.imagenesAdicionales.length > 1) {
                        const sliderHtml = $('<div class="modal-slider"></div>');
                        post.imagenesAdicionales.forEach(imgSrc => {
                            sliderHtml.append(`
                                <div class="modal-slider-item">
                                    <img src="${imgSrc}" alt="${post.titulo}">
                                </div>
                            `);
                        });
                        mediaContainer.append(sliderHtml);

                        // Inicializar Slick Carousel con una mínima espera para renderizado estable
                        setTimeout(() => {
                            sliderHtml.slick({
                                dots: true,
                                infinite: true,
                                speed: 300,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                arrows: true,
                                autoplay: false
                            });
                        }, 50);
                    } else {
                        // Si solo tiene la imagen principal
                        mediaContainer.append(`
                            <div class="modal-slider-item">
                                <img src="${post.imagen}" alt="${post.titulo}">
                            </div>
                        `);
                    }

                    $('#modal-category').text(post.categoria)
                        .removeClass()
                        .addClass('post-category ' + post.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                    $('#modal-date').text(formatDate(post.fecha));
                    $('#modal-title').text(post.titulo);
                    $('#modal-author-name').text(post.autor);
                    $('#modal-content').text(post.contenidoLargo);

                    modal.addClass('active');
                    $('body').css('overflow', 'hidden'); // Prevenir scroll del body de fondo
                }
            });

            // Cerrar modal al hacer clic en botón de cerrar
            closeBtn.on('click', function () {
                closeModal();
            });

            // Cerrar modal al hacer clic fuera de la tarjeta modal (en la capa oscura)
            modal.on('click', function (e) {
                if ($(e.target).hasClass('modal-overlay')) {
                    closeModal();
                }
            });

            // Cerrar modal con la tecla Escape
            $(document).on('keydown', function (e) {
                if (e.key === 'Escape' && modal.hasClass('active')) {
                    closeModal();
                }
            });

            function closeModal() {
                // Destruir slick si existe
                const slider = $('.modal-slider');
                if (slider.hasClass('slick-initialized')) {
                    slider.slick('unslick');
                }
                mediaContainer.empty();

                modal.removeClass('active');
                $('body').css('overflow', '');
            }
        }
    }
});

// ==========================================
// Lógica para la ventana emergente de Integrantes
// ==========================================
$(document).ready(function () {
    const integrantesContainer = $('.integrantes');
    const modal = $('#integrante-modal');

    if (integrantesContainer.length && modal.length) {
        let allIntegrantes = [];

        // Determinar la ruta relativa correcta al JSON
        const jsonPath = window.location.pathname.includes('/partes/') ? '../integrantes.json' : 'integrantes.json';

        // Cargar integrantes desde integrantes.json
        $.getJSON(jsonPath)
            .done(function (data) {
                allIntegrantes = data;
            })
            .fail(function () {
                console.warn('No se pudo cargar integrantes.json vía HTTP/AJAX (posible protocolo local file://). Usando datos locales de respaldo.');
                // Respaldo idéntico al JSON para soportar apertura directa mediante file:// sin servidor local
                allIntegrantes = [
                    { id: "sara", nombre: "Sara", apodo: "Señorita white", rol: "La Jefa / Coordinadora", descripcion: "Conocida como la Señorita White. Es una pieza fundamental en el grupo, siempre involucrada en cada plan y locura, aunque a veces tenga que lidiar con las ocurrencias y el desorden de todos los demás.", frase: "¡Ya compórtense o los desconozco a todos!", gustos: ["Fotografía", "Organizar salidas", "Música indie", "Chismes de calidad"], color: "#e490fd", imagen: "imagenes/Sara.jpeg" },
                    { id: "mateo", nombre: "Mateo", apodo: "El que hizo el blog", rol: "Webmaster & Creador", descripcion: "El cerebro tecnológico del grupo y creador de este blog para inmortalizar todos los recuerdos, salidas y locuras de Los Inservibles. Siempre capturando los mejores momentos y picando código para el parche.", frase: "Tranquilos, yo lo programo y queda god.", gustos: ["Programación", "Diseño web", "Videojuegos", "Planes nocturnos"], color: "#ffffff", imagen: "imagenes/Mateo.jpeg" },
                    { id: "gyver", nombre: "Gyver", apodo: "El negro", rol: "El Alma de la Fiesta", descripcion: "El de la energía inagotable y las risas aseguradas. Donde esté Gyver no hay momento aburrido; es el encargado oficial de subirle el ánimo a la manada y meterle sabor a cualquier salida.", frase: "¡Hoy no se duerme, hoy se vive!", gustos: ["Bailar", "Música urbana", "Hacer reír", "Comida callejera"], color: "#ff5100", imagen: "imagenes/Gyver.jpeg" },
                    { id: "ana", nombre: "Ana", apodo: "La que nunca viene", rol: "Miembro Fantasma VIP", descripcion: "Aparece una vez cada alineación de planetas, pero cuando viene es un evento canónico. Todos la esperan, pocos la ven, pero cuando está presente el grupo se siente completo.", frase: "Esta vez sí voy... mentira, me quedé dormida.", gustos: ["Dormir 14 horas", "Cancelar planes a última hora", "Series", "Café"], color: "#5dccff", imagen: "imagenes/ana.jpeg" },
                    { id: "daniel", nombre: "Daniel", apodo: "El que se cree el prota", rol: "Protagonista de Shonen", descripcion: "Camina como si tuviera un soundtrack de fondo y una cámara lenta siguiéndolo. Cree firmemente que su vida es un anime y que cualquier momento cotidiano es una escena épica.", frase: "Todo forma parte de mi arco de desarrollo de personaje.", gustos: ["Anime", "Gimnasio", "Debates intensos", "Poses épicas"], color: "#ff1616", imagen: "imagenes/Daniel.jpeg" },
                    { id: "felipe", nombre: "Felipe", apodo: "Nate Jacobs Pripra tonjeo", rol: "El Galán del Caos", descripcion: "El personaje con más lore del grupo. Siempre metido en dinámicas inesperadas y con un flow inconfundible. Su apodo lo dice todo: impredecible y con personalidad única.", frase: "Pripra tonjeo y pa lante.", gustos: ["Moda", "Trapear", "Historias intensas", "Música a todo volumen"], color: "#ffbb00", imagen: "imagenes/Felipe.jpeg" },
                    { id: "avril", nombre: "Avril (Avi)", apodo: "La esclavizadora de sara", rol: "Comandante Suprema", descripcion: "Con una sola mirada pone orden o desata el caos total. Tiene a Sara y a medio grupo bajo control diplomático y es experta en liderar las misiones más random que se nos ocurran.", frase: "Sara, ven acá que te necesito para una misión.", gustos: ["Mandar", "Tardes de café", "Maquillaje", "Planes improvisados"], color: "#ff74c3", imagen: "imagenes/Avril.jpeg" },
                    { id: "fabio", nombre: "Fabio", apodo: "Adolf Hitler", rol: "Estratega del Humor Negro", descripcion: "Polémico por naturaleza y dueño del humor más ácido del grupo. Si hay un debate o una broma que cruce la línea, probablemente Fabio la inició. Nadie se salva de sus comentarios.", frase: "No me busquen que me encuentran.", gustos: ["Historia militar", "Humor pesado", "Memes prohibidos", "Estrategia"], color: "#9900ff", imagen: "imagenes/Fabio.jpeg" },
                    { id: "nara", nombre: "Nara", apodo: "La que dibuja", rol: "Directora de Arte", descripcion: "El talento visual del grupo. Mientras los demás hacen desastres, ella probablemente esté haciendo un boceto increíble o creando arte digital. Creativa, observadora y muy cool.", frase: "Espérense, no se muevan que los estoy dibujando.", gustos: ["Ilustración", "Diseño", "Anime", "Música lo-fi"], color: "#0a22ff", imagen: "imagenes/Nara.jpeg" },
                    { id: "isabela", nombre: "Isabela (Isa)", apodo: "Princesa UwU kawaii", rol: "Representante Cute", descripcion: "La ternura hecha persona, o al menos eso aparenta hasta que se junta con el descontrol del grupo. Llena de estética cute, dulzura y comentarios que equilibran la locura de los demás.", frase: "¡Ay no, qué tiernis! (procede a unirse al desastre)", gustos: ["Cosas tiernas", "K-pop / J-pop", "Snacks dulces", "Moda kawaii"], color: "#ff7cba", imagen: "imagenes/Isa.jpeg" },
                    { id: "soto", nombre: "Soto", apodo: "El mas god", rol: "Nivel Dios", descripcion: "La eminencia, la leyenda. Mantiene la calma en medio de cualquier huracán y todo lo que hace le sale bien. Considerado por aclamación popular como el más god de la existencia.", frase: "Simplemente god, nada más que agregar.", gustos: ["Ser god", "Fútbol", "Tranquilidad", "Reírse de las desgracias del resto"], color: "#3b44b8", imagen: "imagenes/soto.jpeg" }
                ];
            });

        // Al hacer clic en una tarjeta de integrante
        integrantesContainer.on('click', '.integrante', function () {
            let memberId = $(this).data('id');

            // Si no tiene data-id explícito, obtenerlo de la clase
            if (!memberId) {
                const classList = ($(this).attr('class') || '').split(/\s+/);
                const possibleIds = ["sara", "mateo", "gyver", "ana", "daniel", "felipe", "avril", "fabio", "nara", "isabela", "soto"];
                memberId = classList.find(c => possibleIds.includes(c.toLowerCase()));
            }

            const member = allIntegrantes.find(m => m.id === memberId);
            if (member) {
                abrirModalIntegrante(member);
            }
        });

        function abrirModalIntegrante(member) {
            const isInPartes = window.location.pathname.includes('/partes/');
            let imgPath = member.imagen;
            if (isInPartes && !imgPath.startsWith('../')) {
                imgPath = '../' + imgPath;
            } else if (!isInPartes && imgPath.startsWith('../')) {
                imgPath = imgPath.replace('../', '');
            }

            $('#modal-integrante-img').attr('src', imgPath).attr('alt', member.nombre);
            $('#modal-integrante-rol').text(member.rol);
            $('#modal-integrante-nombre').text(member.nombre);
            $('#modal-integrante-apodo').text(member.apodo);
            $('#modal-integrante-desc').text(member.descripcion);
            $('#modal-integrante-frase').text('“' + member.frase + '”');

            // Renderizar lista de gustos
            const tagsContainer = $('#modal-integrante-tags');
            tagsContainer.empty();
            if (member.gustos && member.gustos.length) {
                member.gustos.forEach(gusto => {
                    tagsContainer.append(`<span class="modal-tag">${gusto}</span>`);
                });
                $('.modal-tags-section').show();
            } else {
                $('.modal-tags-section').hide();
            }

            // Aplicar estilo de color temático dinámico del integrante
            const accentColor = member.color || '#5dccff';
            $('#modal-integrante-rol').css({
                'color': accentColor,
                'border-color': accentColor,
                'background': hexToRgba(accentColor, 0.15)
            });
            $('#modal-integrante-quote-box').css({
                'border-left-color': accentColor
            });
            $('.integrante-modal-content').css({
                'border-color': accentColor,
                'box-shadow': `0 20px 50px ${hexToRgba(accentColor, 0.25)}`
            });

            modal.addClass('active');
            $('body').css('overflow', 'hidden');
        }

        // Helper para convertir color HEX a RGBA
        function hexToRgba(hex, alpha) {
            let c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length === 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
            }
            return hex;
        }

        // Cerrar modal
        function cerrarModalIntegrante() {
            modal.removeClass('active');
            $('body').css('overflow', '');
        }

        $('#modal-integrante-close').on('click', cerrarModalIntegrante);

        modal.on('click', function (e) {
            if ($(e.target).hasClass('modal-overlay')) {
                cerrarModalIntegrante();
            }
        });

        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && modal.hasClass('active')) {
                cerrarModalIntegrante();
            }
        });
    }
});
