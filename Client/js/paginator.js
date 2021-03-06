var dataLoader = require('../js/dataLoader.js');
var validator = require('../js/validator.js');

var paginator = (function (dataLoader, validator) {
    var paginator = {
        init: function (table, settings) {
            table.events.onDataLoaded.push(paginator.updatePaginator);
            table.paginator = table.paginator || {};
            setCustomPaginator(table, settings)
            // paginator.setPaginator(table, start, end, activePage);
            // paginator.setPageClickEvents(table, dataLoader);
        },
        setPaginator: function (table, start, end, activePage) {
            if (!table.paginator) {
                table.paginator = Object.create(Object);
            }

            table.paginator.start = start;
            table.paginator.end = end;

            var $footer = table._$table.find('[pagination]');
            $footer.children('.pagination').remove();
            var $paginator = $('<ul></ul>')
                .addClass('pagination');

            if (table.paginator.start > 1) {
                var $firstPageElement = $('<li><a href="#" page-first>' + 1 + '</a></li>');
                var $previousPageElement = $('<li><a href="#" page-previous>' + '...' + '</a></li>');
                $paginator.append($firstPageElement);
                $paginator.append($previousPageElement);
            }
            for (var i = start; i <= end; i++) {
                var $currentPageElement = $('<li><a href="#" page>' + i + '</a></li>');
                $paginator.append($currentPageElement);
                if (i == activePage) $currentPageElement.addClass('active');
            }

            if (table.paginator && table.store && table.paginator.end < table.store.numberOfPages) {
                var $nextPageElement = $('<li><a href="#" page-next>' + '...' + '</a></li>');
                var $lastPageElement = $('<li><a href="#" page-last>' + (table.store ? table.store.numberOfPages : "") + '</a></li>');
                $paginator.append($nextPageElement);
                $paginator.append($lastPageElement);
            }

            $footer.append($paginator);

            return $paginator;
        },

        updatePaginator: function (table) {
            var page = table.store.currentPage || 1;
            var numberOfPages = Math.ceil(table.store.numberOfRows / table.settings.paging.pageSize)
            var start, end;
            var length = table.settings.paginator.length;
            var halfLength = Math.floor((length - 1) / 2);
            var currentPaginatorLength = Math.min(length, numberOfPages);

            table.paginator.currentPage = page;

            table.store.numberOfPages = numberOfPages;
            if (currentPaginatorLength > 0) {
                start = Math.max(Math.floor(page - halfLength), 1);
                end = Math.min(start + currentPaginatorLength - 1, numberOfPages);
                if (end - start + 1 < currentPaginatorLength) {
                    end = page;
                    start = Math.max(1, end - length + 1);
                };
            } else {
                start = 0;
                end = -1;
            }

            table.paginator.$paginator = paginator.setPaginator(table, start, end, page);
        },

        setPageClickEvents: function (table, dataLoader) {
            table.$table.on('click', '.pagination li>a[page], li>a[page-first], li>a[page-last]', function (e) {
                var page = $(e.target).html();

                table.paginator.currentPage = page;
                table.paginator.$paginator.children('li').removeClass('active');

                dataLoader.loadData(table, page);
            });

            table.$table.on('click', 'li>a[page-next]', function (e) {
                var page = parseInt(table.paginator.currentPage) + 1;

                dataLoader.loadData(table, page, true);
            });

            table.$table.on('click', 'li>a[page-previous]', function (e) {
                var page = parseInt(table.paginator.currentPage) - 1;
                table.paginator.currentPage = page;

                dataLoader.loadData(table, page, true);
            });
        }
    };

    function setCustomPaginator(table, settings) {
        if (!settings.paginator) return;
        if (settings.paginator.length) {
            validator.ValidateShouldBeANumber(settings.paginator.length, "settings.paginator.length");
            table.settings.paginator.length = settings.paginator.length;
        }
    }

    return paginator;
} (dataLoader, validator));

module.exports = paginator;