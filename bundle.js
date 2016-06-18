(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// // Some code
var vDataTable = require('../js/v-data-table.js');

var tb = vDataTable().init('#table', {
  ajax: {
    url: 'http://localhost:65219/home/index'
  },
  columns: {
    Salary: {
      render: function (content) {
        return '**' + content + '$$$**';
      }
    },
    Actions: {
      render: function () {
        return '<button>button</button>';
      }
    }
  },
  features: {
    // selectable: true
    selectable: function ($row) {
      return $row.children().first('td').html();
    }
  }
});

$('#btnGetSelected').on('click', function () {
  tb.getSelected();
});
},{"../js/v-data-table.js":7}],2:[function(require,module,exports){

var dataLoader = (function () {
    var paginator = require('../js/paginator.js');

    var dataLoader = {
        loadData: function (table, page, isUpdatePaginator) {
            paginator(table).updatePaginator = paginator(table).updatePaginator || true;

            $.ajax({
                url: table.settings.ajax.url,
                data: {
                    page: page,
                    pageSize: table.settings.pageSize,
                    filter: table.filter,
                    orderBy: table.orderBy ? table.orderBy.Name : null,
                    asc: table.orderBy ? table.orderBy.Asc : true
                },
                success: function (data) {
                    refreshPageData(table, data.data);
                    if (isUpdatePaginator) {
                        paginator(table).updatePaginator(page, Math.ceil(data.rowsNumber / table.paginator.length));
                    }
                }
            });
        }
    };

    function refreshPageData(table, data) {
        table.data = data;
        var $tbody = table.$table.children('tbody').empty();
        // TODO: To foreach the table._columnPropertyNames instead of the response data columns
        for (var row = 0; row < data.length; row++) {
            var element = data[row];
            var $row = $('<tr>');

            for (var col = 0; col < table._columnPropertyNames.length; col++) {
                var $col = $('<td>').html(render(table, table._columnPropertyNames[col], element[table._columnPropertyNames[col]]));
                $row.append($col);
            }

            formatRow(table, $row);

            $tbody.append($row);
        }
    }

    function render(table, colName, content) {
        if (table.settings && table.settings.columns && table.settings.columns[colName] && table.settings.columns[colName].render) {
            return table.settings.columns[colName].render(content);
        };

        return content;
    }

    function formatRow(table, $row) {
        if (isSelected(table, $row)) {
            $row.css('backgroundColor', table.settings.colors.selectedRow);
        }
    }

    function isSelected(table, $row) {
        return table.store.selectedRows.includes($row[0])
    }

    return dataLoader;
} ());

module.exports = dataLoader;
},{"../js/paginator.js":4}],3:[function(require,module,exports){
var filter = (function () {
    'use strict';
    var dataLoader = require('../js/dataLoader.js');

    return {
        setFilterEvent: function (table) {
            var $filter = $(table.$table[0]).find('.filter');
            $filter.on('change', function () {
                dataLoader.loadData(table, 1, true);
            });
        }
    };
} ());

module.exports = filter;
},{"../js/dataLoader.js":2}],4:[function(require,module,exports){
var paginator = function (table) {
    var dataLoader = require('../js/dataLoader.js');

    var paginator = {
        setPaginator: function (start, end, activePage) {
            table.paginator.start = start;
            table.paginator.end = end;

            var $footer = table._$table.children('tfoot').first();
            $footer.children('.pagination').remove();
            var $paginator = $('<ul></ul>')
                .addClass('pagination');

            $footer.append($paginator);

            for (var i = start; i <= end; i++) {
                var $currentPageElement = $('<li><a href="#">' + i + '</a></li>');
                $paginator.append($currentPageElement);
                if (i == activePage) $currentPageElement.addClass('active');
            }

            return $paginator;
        },

        updatePaginator: function (page, numberOfPages) {
            var start, end;
            var length = table.paginator.length;
            var halfLength = Math.floor((length - 1) / 2);
            var currentPaginatorLength = Math.min(length, numberOfPages);

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

            table.paginator.$paginator = paginator.setPaginator(start, end, page);
            paginator.setPageClickEvents(this);
        },

        setPageClickEvents: function () {
            table.paginator.$paginator.on('click', 'li>a', function (e) {
                var page = $(e.target).html();
                table.paginator.$paginator.children('li').removeClass('active');
                $(e.target).parent().addClass('active');

                dataLoader.loadData(table, page, page == table.paginator.start || page == table.paginator.end);
            });
        }
    };

    return paginator;
};

module.exports = paginator;
},{"../js/dataLoader.js":2}],5:[function(require,module,exports){
// var $ = require('jquery');

var selectable = (function () {
    var selectable = {
        makeSelectable: function (table) {
            var $tbody = table.$table.find('tbody');

            $tbody.on('click', function (e) {
                $row = $(e.target).parentsUntil('tbody').first();

                if (!e.ctrlKey && !isSelected(table, $row)) {
                    $tbody.find('tr').css('background-color', 'white');
                    table.store.selectedRows = [];

                    $row.css('background-color', 'gray');
                }

                if (isSelected(table, $row)) {
                    RemoveFromArray($row[0], table.store.selectedRows);
                    $row.css('background-color', 'white');
                } else {
                    table.store.selectedRows.push($row[0]);
                    $row.css('background-color', 'gray');
                }
            });
        },

        getSelected: function (table) {
            var result = [];
            var selectedRows = table.store.selectedRows;
            var delegate = table.settings.features.selectable;

            if (selectedRows == null || selectedRows.length == 0) {
                return null;
            }

            for (var i = 0, l = selectedRows.length; i < l; i += 1) {
                result.push(delegate($(selectedRows[i])));
            }

            console.log(result);
        }
    };

    function isSelected(table, $row) {
        return table.store.selectedRows.includes($row[0])
    }

    function RemoveFromArray(element, arr) {
        var index = arr.indexOf(element);
        arr.splice(index, 1);
    }

    return selectable;
})();

module.exports = selectable;
},{}],6:[function(require,module,exports){
var sortable = (function () {
    'use strict';
    var dataLoader = require('../js/dataLoader.js');

    return {
        formatSortables: function (table) {
            var $sortables = table.$table.find('thead tr:last-child th[sortable]');

            $sortables.on('click', function (e) {
                var name = $(e.target).attr('data-colName');
                var isAsc = (table.orderBy && table.orderBy.Name == name) ? !table.orderBy.Asc : true;
                table.orderBy = {
                    Name: name,
                    Asc: isAsc
                };

                $sortables.removeAttr('asc desc');
                if (isAsc) {
                    $(e.target).attr('asc', '')
                } else {
                    $(e.target).attr('desc', '')
                }

                dataLoader.loadData(table, 1);
            });
        },
    }
})();

module.exports = sortable;
},{"../js/dataLoader.js":2}],7:[function(require,module,exports){
var selectable = require('../js/selectable.js');
var sortable = require('../js/sortable.js');
var dataLoader = require('../js/dataLoader.js');
var paginator = require('../js/paginator.js');
var filter = require('../js/filter.js');

vDataTable = function () {
  'use strict'

  var defaultSettings = {
    pageSize: 5,
    paginator: {
      length: 5
    },
    features: {
      enableFilter: true,
      selectable: true
    }
  };

  var table = {
    init: function (selector, settings) {
      this._$table = $(selector).first();
      this._$table._currentPage = 1;

      // Paginator settings
      this._paginator = {};
      this._paginator.length = (settings.paginator && settings.paginator.length) || defaultSettings.paginator.length;
      this._paginator.$paginator = paginator(this).setPaginator(1, this._paginator.length, 1);
      this._columnPropertyNames = setColumnPropertyNames();

      // Data
      this.store = {
        selectedRows: []
      };

      // Settings
      this._settings = {
        ajax: {
          url: settings.ajax.url
        },
        colors: {
          selectedRow: 'gray',
        },
        pageSize: settings.pageSize || defaultSettings.pageSize,
        features: {
          selectable: settings.features.selectable
        },
        columns: settings.columns || {}
      }

      paginator(this).setPageClickEvents(this);
      filter.setFilterEvent(this);
      sortable.formatSortables(this);
      dataLoader.loadData(table, 1);

      if (settings.features) {
        processFeatures(settings.features);
      };

      return this;
    },

    get settings() {
      return this._settings;
    },

    get paginator() {
      return this._paginator;
    },

    get $table() {
      return this._$table;
    },

    get filter() {
      var $filter = $(table.$table[0]).find('.filter');
      return $filter.val();
    },

    getSelected: function () {
      return selectable.getSelected(this);
    }
  };

  function processFeatures(features) {
    if (features.selectable) {
      selectable.makeSelectable(table);
    };
  }

  function setColumnPropertyNames() {
    var colPropNames = [];
    var $columns = table.$table.find('thead tr:last-child').children();
    for (var i = 0; i < $columns.length; i++) {
      colPropNames.push($($columns[i]).attr('data-colName'));
    }

    return colPropNames;
  };

  return table;
};

module.exports = vDataTable;
},{"../js/dataLoader.js":2,"../js/filter.js":3,"../js/paginator.js":4,"../js/selectable.js":5,"../js/sortable.js":6}]},{},[1]);