// var tb1 = dataTable().init('#table', {
//     ajax: {
//         url: null
//     }
// });

var tb = dataTable.init('#table', {
    ajax: {
        url: 'http://localhost:65219/home/indexDB'
    },

    spinner: {
        enable: true, // default value is "true"
        style: 3
    },

    columns: {
        Salary: {
            render: function (content, rowData) {
                return content + ' $';
            }
        },

        Actions: {
            render: function () {
                return '<button class="btn-edit">Edit</button>' +
                    '<button class="btn-save">Save</button>';
            }
        },

        StartDate: {
            render: function (content) {
                var milli = content.replace(/\/Date\((-?\d+)\)\//, '$1');
                var d = new Date(parseInt(milli));
                var formattedDate = d.getUTCDate() + "." + d.getUTCMonth() + "." + d.getUTCFullYear();

                return formattedDate;
            }
        }
    },

    paging: {
        enable: true,
        pageSize: 20
    },

    features: {
        identifier: 'Id',
        selectable: {
            enable: true,
            cssClasses: 'success'
        },
        editable: {
            columns: {
                FirstName: {
                    edit: function ($td) {
                        var val = $td.html();
                        var $input = $('<input>');
                        $input.val(val);
                        $td.html($input);
                    },

                    save: function ($td) {
                        var val = $td.find('input').first().val();

                        return val;
                    }
                },
                LastName: {
                    edit: function ($td) {
                        var val = $td.html();
                        var $input = $('<input>');
                        $input.val(val);
                        $td.html($input);
                    },

                    save: function ($td) {
                        var val = $td.find('input').first().val();

                        return val;
                    }
                }
            },

            update: function (data) {
                console.log(data);
            }
        }
    }
});

$('table').on('click', '.btn-edit', function (e) {
    var $row = $(e.target).parent().parent();
    tb.edit($row);
});

$('table').on('click', '.btn-save', function (e) {
    var $row = $(e.target).parent().parent();
    tb.save($row)
});

$('#btnGetSelected').on('click', function () {
    var selectedIdentifiers = tb.getSelected();
    console.log(selectedIdentifiers);
});

$('#selectAll').on('click', function () {
    tb.selectAll();
});

$('#unselectAll').on('click', function () {
    tb.unselectAll();
});