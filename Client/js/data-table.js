var selectable = require('../js/selectable.js');
var sortable = require('../js/sortable.js');
var dataLoader = require('../js/dataLoader.js');
var paginator = require('../js/paginator.js');
var filter = require('../js/filter.js');
var editable = require('../js/editable');
var validator = require('../js/validator.js');
var settingsExternal = require('../js/dt-settings.js');
var features = require('../js/features.js');
var renderer = require('../js/renderer.js');
var spinner = require('../js/spinners.js');

window.dataTable = (function (selectable, sortable, dataLoader, paginator, filter,
    editable, validator, settingsExternal, features, renderer, spinner) {
    'use strict'

    var table = {
        init: function (selector, settings) {
            this._$table = $(selector).first();

            // Settings
            this._settings = settingsExternal.init(settings);
            // Init objects
            configureEvents(this);
            configureStore(this);

            configurePaginator(this, settings, dataLoader);
            spinner.init(this, settings);
            filter.init(table);
            sortable.init(table);
            editable.init(this, settings);
            selectable.init(this, settings);
            features.init(this);
            renderer.init(this);

            dataLoader.loadData(table, 1, true);

            return this;
        },

        get settings() {
            return this._settings;
        },

        get paginator() {
            return this._paginator;
        },
        set paginator(val) {
            this._paginator = val;
        },

        get $table() {
            return this._$table;
        },

        get filter() {
            return table.store.filter;
        },

        getSelected: function () {
            return selectable.getSelected(this);
        },

        get columnPropertyNames() {
            return this._columnPropertyNames;
        }
    };

    function configureEvents(table) {
        table.events = Object.create(Object);
        table.events.onDataLoaded = [];
        table.events.onDataLoading = [];
        table.events.onTableRendered = [];
    }

    function configureStore(table) {
        table.store = {
            columnPropertyNames: getColumnPropertyNames(),
            pageData: null,
            data: {},
            requestIdentifiersOnDataLoad: false,
        };
    }

    function configurePaginator(table, settings, dataLoader) {
        paginator.init(table, settings);
        paginator.setPageClickEvents(table, dataLoader);
    }

    function getColumnPropertyNames() {
        var colPropNames = [];
        var $columns = table.$table.find('thead th');
        for (var i = 0; i < $columns.length; i++) {
            var colName = $($columns[i]).attr('data-name');
            if (colName) {
                colPropNames.push(colName);
            }
        }

        return colPropNames;
    };

    return table;
})(selectable, sortable, dataLoader, paginator, filter, editable, validator, settingsExternal, features, renderer, spinner);

module.exports = window.dataTable;