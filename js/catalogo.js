(function () {
    'use strict';

    var libreria = window.libreria;
    var document = window.document;

    var contenedor = document.getElementById('contenedor-catalogo');
    var estado = document.getElementById('catalogo-estado');
    var sinResultados = document.getElementById('catalogo-sin-resultados');
    var formulario = document.querySelector('#vista-catalogo form');

    function filtrarLibros(texto) {
        var filtro = (texto || '').trim();
        if (filtro === '') {
            return libreria.libros;
        }
        var termino = filtro.toLowerCase();
        return libreria.libros.filter(function (libro) {
            return libro.titulo.toLowerCase().indexOf(termino) !== -1;
        });
    }

    function crearTarjetaLibro(libro) {
        var editorial = libreria.editoriales.find(function (e) { return e.id === libro.editorialId; });
        var genero = libro.generoId !== null ? libreria.generos.find(function (g) { return g.id === libro.generoId; }) : null;
        var autoresNombres = libro.autoresIds.map(function (aid) {
            var a = libreria.autores.find(function (aut) { return aut.id === aid; });
            return a ? a.nombre : '';
        }).join(', ');

        var article = document.createElement('article');
        article.className = 'tarjeta';

        var h3 = document.createElement('h3');
        h3.textContent = libro.titulo;
        article.appendChild(h3);

        var dl = document.createElement('dl');

        var campos = [
            { etiqueta: 'Título', valor: libro.titulo },
            { etiqueta: 'ISBN', valor: libro.isbn },
            { etiqueta: 'Editorial', valor: editorial ? editorial.nombre : '' },
            { etiqueta: 'Género', valor: genero ? genero.nombre : 'Sin clasificar' },
            { etiqueta: 'Autor(es)', valor: autoresNombres },
            { etiqueta: 'Precio', valor: '$' + libro.precio.toFixed(2) }
        ];

        campos.forEach(function (campo) {
            var dt = document.createElement('dt');
            dt.textContent = campo.etiqueta;
            dl.appendChild(dt);

            var dd = document.createElement('dd');
            dd.textContent = campo.valor;
            dl.appendChild(dd);
        });

        article.appendChild(dl);

        var precio = document.createElement('p');
        precio.className = 'precio';
        precio.textContent = '$' + libro.precio.toFixed(2);
        article.appendChild(precio);

        return article;
    }

    function renderCatalogo(librosAFiltrar, textoBusqueda) {
        while (contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild);
        }

        librosAFiltrar.forEach(function (libro) {
            contenedor.appendChild(crearTarjetaLibro(libro));
        });

        var texto = (textoBusqueda || '').trim();
        if (texto === '') {
            estado.textContent = 'Estado: Mostrando catálogo completo.';
            estado.hidden = false;
            sinResultados.hidden = true;
        } else if (librosAFiltrar.length === 0) {
            sinResultados.textContent = 'No se encontraron libros que coincidan con la búsqueda.';
            sinResultados.hidden = false;
            estado.hidden = true;
        } else {
            estado.hidden = true;
            sinResultados.hidden = true;
        }
    }

    function inicializar() {
        renderCatalogo(libreria.libros);

        formulario.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = document.getElementById('buscar-titulo');
            var texto = input ? input.value : '';
            var filtrados = filtrarLibros(texto);
            renderCatalogo(filtrados, texto);
        });
    }

    inicializar();

    window.catalogo = window.catalogo || {};
    window.catalogo.filtrarLibros = filtrarLibros;
    window.catalogo.renderCatalogo = renderCatalogo;
})();
