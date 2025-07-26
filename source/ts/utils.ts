
// ----- DOM helper functions -----

// Append text to the DOM
function append_text(txt) {
    var docbody = document.getElementsByTagName('body')[0];
    docbody.appendChild(document.createTextNode(txt));
    docbody.appendChild(document.createElement('br'));
}

// Append row heading to a row
function append_th(row, txt) {
    var tdata = document.createElement('th');
    tdata.classList.add('px-2', 'border-l', 'border-r', 'border-b', 'border-gray-300');
    tdata.appendChild(document.createTextNode(txt));
    row.appendChild(tdata);
}

// Append row data to a row
/**
 * Append td tag 
 * 
 * @param row
 * @param txt
 */
function append_td(row, txt) {
    var tdata = document.createElement('td');
    tdata.classList.add('px-2', 'border-l', 'border-r', 'border-b', 'border-gray-300');
    tdata.appendChild(document.createTextNode(txt));
    row.appendChild(tdata);
}

// Append a row of data to a table
/**
 * Apprend tr tag
 * 
 * @param table
 */
function append_tr(table, ...args) {
    var trow = document.createElement('tr');
    for (var i = 0; i < args.length; ++i) {
        append_td(trow, args[i]);
    }
    table.appendChild(trow);
    // @ts-ignore
    tableRowIndex++;
    // @ts-ignore
    if (tableRowIndex % 2 === 0) trow.classList.add('bg-gray-100');    
}

// Append a table to the DOM and return a reference to it
// Arguments are table headings (variable length)
/**
 * Make table
 * 
 * @returns
 */
function make_table(...args) {
    var docbody, table, thead, tbody, center, trow;

    docbody = document.getElementsByTagName('body')[0];
    table = document.createElement('table');
    table.classList.add('border', 'border-gray-400');
    table.setAttribute('border', '1');
    thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'border-b', 'border-gray-300');
    table.appendChild(thead);
    tbody = document.createElement('tbody');
    tbody.classList.add('bg-white', 'border-b', 'border-gray-300');
    table.appendChild(tbody);
    center = document.createElement('center');
    center.classList.add('py-6');
    center.appendChild(table);
    docbody.appendChild(center);

    trow = document.createElement('tr');
    trow.classList.add('border-b', 'border-gray-400');
    for (var i = 0; i < args.length; ++i) {
        append_th(trow, args[i]);
    }
    thead.appendChild(trow);

    return tbody;
}