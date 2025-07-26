
// ----- Inventory scoring functions -----

// Score the test
function score() {
    $('#d-results-loading').removeClass('hidden');

    try {
        // Change mouse pointer to wait indicator
        // This does not seem to work because JavaScript blocks the UI message pump :(
        document.body.style.cursor = "wait";

        // Variable declarations
        //var s;
        var i, j, scale, tscale, q, n, rp;
        var k, rawscore, kscore, tscore, percent;
        var t_cnt, f_cnt, cs_cnt, pe;

        // Make the scale and critical item tables
        var scale_table = make_table("Scale", "Scale Description", "Raw Score", "K Score", "T Score", "% Answered");
        var ci_table = make_table("Scale", "Scale Description", "Question", "Answer", "Question Text");
        var ua_table = make_table("#", "Unanswered Questions");

        // Count the number of True, False, and Can't Say answers
        n = globalThis.longform ? questions.length : 371;
        t_cnt = 0;
        f_cnt = 0;
        cs_cnt = 0;
        for (q = 1; q < n; ++q) {
            switch (globalThis.ans[q]) {
                case "T":
                    ++t_cnt;
                    break;
                case "F":
                    ++f_cnt;
                    break;
                default:
                    ++cs_cnt;
                    append_tr(ua_table, q, globalThis.questions[q]);
                    break;
            }
        }
        --q;

        // Add T/F/? stats to scale table
        append_tr(scale_table, "True", " ", t_cnt, " ", " ", (t_cnt * 100 / q).toPrecision(3));
        append_tr(scale_table, "False", " ", f_cnt, " ", " ", (f_cnt * 100 / q).toPrecision(3));
        append_tr(scale_table, "?", " ", cs_cnt, " ", " ", (cs_cnt * 100 / q).toPrecision(3));


        // Score the scales and critical items
        k = 0;
        pe = 0;
        // Iterate all the scales
        for (i = 0; i < scales.length; ++i) {
            scale = scales[i];
            n = 0;
            rawscore = scale.base_score || 0;

            // Get the T score table, critcal items will not have this (undefined)
            tscale = scale.t_scale;
            if (tscale) { tscale = (globalThis.gender ? tscale.female : tscale.male); }

            // Iterate the True question list
            if (scale.true_questions) {
                for (j = 0; j < scale.true_questions.length; ++j) {
                    // Get the question number
                    q = scale.true_questions[j];
                    // Act upon the answer to that question
                    switch (globalThis.ans[q]) {
                        // True 
                        case "T":
                            // Increment the answer count
                            ++n;
                            // Increment raw score only if True
                            ++rawscore;
                            // If this is a critcal item, add it to the critical items table
                            if (tscale === undefined) {
                                append_tr(ci_table, scale.name, scale.description, q, "True", questions[q]);
                            }
                            break;
                        case "F":
                            // Increment the answer count
                            ++n;
                            break;
                    }
                }
            }
            // Iterate the False question list (same procedure as True above)
            if (scale.false_questions) {
                for (j = 0; j < scale.false_questions.length; ++j) {
                    q = scale.false_questions[j];
                    switch (globalThis.ans[q]) {
                        case "F":
                            ++n;
                            ++rawscore;
                            if (tscale === undefined) {
                                append_tr(ci_table, scale.name, scale.description, q, "False", questions[q]);
                            }
                            break;
                        case "T":
                            ++n;
                            break;
                    }
                }
            }
            // Score a *RIN scale
            if (scale.rin) {
                // Iterate all the answer pairs
                for (j = 0; j < scale.rin.length; ++j) {
                    // Get reference to answer pair
                    rp = scale.rin[j];
                    // If answers match, update the raw score
                    if (globalThis.ans[rp[0]] === rp[1] && globalThis.ans[rp[2]] === rp[3]) {
                        rawscore += rp[4];
                    }
                    if (globalThis.ans[rp[0]] !== "?" && globalThis.ans[rp[2]] !== "?") {
                        ++n;
                    }
                }
            }
            // Add scale results to scale table
            // T score table must be defined, otherwise this is a critical item
            if (tscale !== undefined) {
                // Capture K for future use
                if (scale.name === "K") { k = rawscore; }
                // If there is a K correction, use it
                if (scale.t_scale.k_correction) {
                    // Adjust with K
                    kscore = k * scale.t_scale.k_correction + rawscore;
                    // Round off and make integer
                    kscore = Math.floor(kscore + 0.5);
                    // T score lookup of corrected score
                    tscore = tscale[kscore];
                    // No K correction
                } else {
                    // K score is undefinded
                    kscore = undefined;
                    // T score lookup of raw score
                    tscore = tscale[rawscore];
                }

                // Calculate percent answered
                percent = scale.rin ?
                    (n * 100 / scale.rin.length) :
                    (n * 100 / (scale.true_questions.length + j));

                // Append results to score table
                append_tr(scale_table, scale.name, scale.description, rawscore, kscore || " ", tscore, percent.toPrecision(3));

                // Save score in scale array
                scale.raw_score = rawscore;
                scale.t_score = tscore;
                scale.response = percent;

                // Update profile elevation for the 8 scales
                switch (scale.name) {
                    case "Hs":
                    case "D":
                    case "Hy":
                    case "Pd":
                    case "Pa":
                    case "Pt":
                    case "Sc":
                    case "Ma":
                        pe += tscore;
                        break;
                }
            }
        }
        // Convert profile elevation sum to average (divide by number of scales)
        pe /= 8;
        // Show profile elevation in page
        append_text("Profile Elevation: " + pe.toPrecision(3));

        // Draw charts
        draw_chart("canvasVCS", "Validity and Clinical Scales Profile", [0, 1, 2, 3, 4, 5, 6, 7, undefined, 9, 10, 11, 12, globalThis.gender ? 14 : 13, 15, 16, 17, 18, 19], true);
        //draw_chart("canvas","Profile for Basic Scales",[5,2,6,undefined,9,10,11,12,gender?14:13,15,16,17,18,19]);
        //draw_chart("canvas","Validity Pattern",[0,1,2,3,4,5,6,7]);
        draw_chart("canvasRCS", "Restructured Clinical Scales Profile", [92, 93, 94, 95, 96, 97, 98, 99, 100], true);
        draw_chart("canvasPSY", "PSY-5 Scales Profile", [101, 102, 103, 104, 105], true);
        draw_chart("canvasCSP", "Content Scales Profile", [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65], false);
        draw_chart("canvasSS", "Supplementary Scales Profile", [66, 67, 68, 75, 76, 77, 80, 72, 73, 74, 69, 70, 71, 78, 79], false);
        //draw_chart("canvas","Supplementary Scales",[69,71,70,80,73,72]);
        //draw_chart("canvas","Clinical Subscales 1",[20,21,22,23,24,undefined,25,26,27,28,29,undefined,30,31,32,33,34]);
        //draw_chart("canvas","Clinical Subscales 2",[35,36,37,undefined,38,39,40,41,42,43]);
        //draw_chart("canvas","Clinical Subscales 3",[44,45,46,47,undefined,48,49,50]);
        //draw_chart("canvas","Content Subscales 1",[106,107,undefined,108,109,110,111,undefined,112,113,114,undefined,	115,116]);
        //draw_chart("canvas","Content Subscales 2",[117,118,undefined,119,120,undefined,121,122,undefined,123,124]);
        //draw_chart("canvas","Content Subscales 3",[125,126,undefined,127,128,undefined,129,130,undefined,131,132]);

        const timeoutExceededLabel = setTimeout(function (): void {
            $('#d-results-loading-label-1').val('Se este ecrã demorar mais que um minuto é provável que o cálculo tenha falhado devido a um erro.');
        }, 35000);
        document.body.style.cursor = 'auto';
        $('#d-results-loading').addClass('hidden');

        clearTimeout(timeoutExceededLabel);
    } catch (error) {
        console.log(error);
        // Restore mouse pointer
        document.body.style.cursor = "auto";
        $('#d-results-loading').addClass('hidden');
    }
}

// Read status of radio button group and return value of selected button
function radio_value(rb) {
    if (!rb) { return; }
    for (var i = 0; i < rb.length; i++) {
        if (rb[i].checked === true) {
            return rb[i].value;
        }
    }
}

// Fill the answer array with radio button state and score
function score_rb(form) {
    globalThis.ans = [undefined];
    for (var i = 1; i < questions.length; ++i) {
        var rbv = radio_value(form.elements["Q" + i]);
        globalThis.ans.push(rbv || "?");
    }

    // Update answers text box
    update_score_text();

    // Score the inventory
    score();
}

// Update the form radio buttons from the answer array
function update_rb() {
    var n, q;
    for (n = 1; n < questions.length; ++n) {
        // @ts-ignore
        q = document.forms.questions["Q" + n];
        switch (globalThis.ans[n]) {
            case "F":
                q[0].checked = true;
                break;
            case "T":
                q[1].checked = true;
                break;
            default:
                q[0].checked = false;
                q[1].checked = false;
                break;
        }
    }
}

// Fill the answer array from text and score
function score_text(anstext) {
    //alert("Score Text: "+anstext.length);
    globalThis.ans = [undefined];
    var n = 1;
    // Check each character of text
    for (var i = 0; i < anstext.length; ++i) {
        // Ignore control characters (0 to 31) and space (32)
        if (anstext.charCodeAt(i) > 32) {
            // Convert character to 'T','F' or '?'
            var a;
            switch (anstext.charAt(i)) {
                case "T":
                case "t":
                case "Y":
                case "y":
                case "X":
                case "x":
                    a = "T";
                    break;
                case "F":
                case "f":
                case "N":
                case "n":
                case "O":
                case "o":
                    a = "F";
                    break;
                case "?":
                case "-":
                    a = "?";
                    break;
                default:
                    a = undefined;
                    break;
            }
            // Save valid answer in answer array
            if (a) {
                globalThis.ans.push(a);
                ++n;
            }
        }
    }
    alert((n - 1) + " answers entered");
    // If too few valid characters where processed, fill the remaining answers with '?'
    for (; n < questions.length; ++n)
        globalThis.ans.push("?");

    // Update radio buttons
    update_rb();

    // Score the inventory
    score();
}

// Update the answer text box from the answer array
function update_score_text() {
    var s = "";
    var q;
    for (q = 1; q < questions.length; ++q) {
        s += globalThis.ans[q];
        if (q % 75 === 0) {
            s += "\n";
        }
    }
    // @ts-ignore
    $('#ata').val(s);
    //document.forms.anstext.ata.value = s;
}