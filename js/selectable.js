var selectable = (function () {
    var selectable = {
        makeSelectable: function (table) {
            var $tbody = table.$table.find('tbody');

            $tbody.on('click', function (e) {
                $row = $(e.target).parentsUntil('tbody').last();
                var identifier = $row.attr('data-identifier');
                var rowIsSelected = isSelected(table, identifier);
                var numberOfSelectedRows;

                debugger;
                // No Ctrl && Row is not selected
                if (!e.ctrlKey) {
                    numberOfSelectedRows = selectable.unselectAll(table);
                    // $tbody.find('tr').css('background-color', 'white');
                    // setRowSelectCssClasses(table, $tbody.find('tr'), false);
                }

                if (rowIsSelected) {
                    if (numberOfSelectedRows > 2) {
                        setIdentifierSelectStatus(table, identifier, true);
                    } else {
                        setIdentifierSelectStatus(table, identifier, false);
                    }
                } else {
                    setIdentifierSelectStatus(table, identifier, true);
                }

                selectable.refreshPageSelection(table);
                // if (rowIsSelected) {
                //     RemoveFromArray($row[0], table.store.selectedRows);
                //     setIdentifierSelectStatus(table, identifier, false);
                //     // $row.css('background-color', 'white');
                //     setRowSelectCssClasses(table, $row, true);
                // } else {
                //     setIdentifierSelectStatus(table, identifier, true);
                //     // $row.css('background-color', 'gray');
                //     setRowSelectCssClasses(table, $row, true);
                // }
            });

            table.selectAll = function () {
                selectable.selectAll(table);
                selectable.refreshPageSelection(table);
            };

            table.unselectAll = function () {
                selectable.unselectAll(table);
            };
        },

        getSelected: function (table) {
            var selectedIdentifiers = table.store.identifiers.filter(function (elem) {
                return elem.selected === true;
            }).map(function (elem) {
                return elem.identifier;
            });

            console.log(selectedIdentifiers);
        },

        initIdentifiers(table, identifiers) {
            table.store.identifiers = [];

            for (var i = 0, l = identifiers.length; i < l; i += 1) {
                table.store.identifiers.push({
                    selected: false,
                    identifier: identifiers[i]
                });
            }
        },

        unselectAll: function (table) {
            var numberOfModifiedRows = 0;
            if (table.store.identifiers) {
                table.store.identifiers.map(function (elem) {
                    if (elem.selected == true) {
                        numberOfModifiedRows += 1;
                    }

                    elem.selected = false;

                    return elem;
                });

                this.refreshPageSelection(table);

                return numberOfModifiedRows;
            }
        },

        selectAll: function (table) {
            if (table.store.identifiers) {
                table.store.identifiers.map(function (elem) {
                    elem.selected = true;

                    return elem;
                });
            }
        },

        refreshPageSelection: function (table) {
            var tableRows = table.$table.find('tbody tr').slice();
            for (var i = 0, l = tableRows.length; i < l; i += 1) {
                var $row = $(tableRows[i]);
                var rowIdentifier = $row.attr('data-identifier');
                if (isSelected(table, rowIdentifier)) {
                    // $row.css('background-color', 'gray');
                    setRowSelectCssClasses(table, $row, true);
                } else {
                    // $row.css('background-color', '');
                    setRowSelectCssClasses(table, $row, false);
                }
            }
        }
    };

    function setRowSelectCssClasses(table, $row, isSelected) {
        var cssClasses = table.settings.features.selectable.cssClasses;
        if (isSelected) {
            $row.addClass(cssClasses);
        } else {
            $row.removeClass(cssClasses);
        }
    }

    function isSelected(table, identifier) {
        var identifierObj = table.store.identifiers.find(function (el) {
            return el.identifier == identifier;
        });

        return identifierObj.selected;
    }

    function RemoveFromArray(element, arr) {
        var index = arr.indexOf(element);
        arr.splice(index, 1);
    }

    function setIdentifierSelectStatus(table, identifier, selected) {
        var identifiers = table.store.identifiers;

        var element = identifiers.filter(function (element) {
            return element.identifier == identifier;
        })[0];

        element.selected = selected;
    }

    return selectable;
})();

module.exports = selectable;