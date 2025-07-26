
// ----- Chart drawing functions -----

var scale_top = 40;
var scale_bottom = scale_top + (90 * 4);

function t2y(t) {
    // T range is 30 to 120
    return scale_bottom - ((t - 30) * 4);
}

function draw_scale(ctx, tscale, x) {
    var i = 0;
    var y = 0;
    var t;
    ctx.beginPath();
    if (globalThis.chart_style === 1) {
        for (i = 0; i < tscale.length; ++i) {
            t = parseInt(tscale[i]);
            if (t) {
                y = t2y(t);
                if (i < tscale.length - 2) {
                    i = tscale.length - 2;
                    if (t > 50) { continue; }
                }
                ctx.moveTo(x - 10, y);
                ctx.lineTo(x - 1, y);
                ctx.moveTo(x + 1, y);
                ctx.lineTo(x + 10, y);
            }
        }
    } else {
        for (i = 0; i < tscale.length; ++i) {
            t = parseInt(tscale[i]);
            if (t) {
                y = t2y(t);
                if (i % 5) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + 8, y);
                } else {
                    ctx.moveTo(x - 8, y);
                    ctx.lineTo(x + 8, y);
                    ctx.stroke(); // excanvas requires this
                    ctx.drawTextRight(7, x - 10, y + 3, "" + i);
                    ctx.beginPath();  // excanvas requires this
                }
            }
        }
    }
    ctx.stroke();
}

function draw_chart(id, title, scale_list, welsh_labels) {
    var ctx;
    var scale_count, scale_spacing, scale_width;
    var legend_x_l, legend_x_r;
    var y, s, x, si, sr, px, py;
    var lth = 10;
    var lys = 15;

    var canvas: HTMLElement | null = document.getElementById(id);

    // @ts-ignore
    if (canvas.getContext) {

        // @ts-ignore
        ctx = canvas.getContext("2d");

        // @ts-ignore
        CanvasTextFunctions.enable(ctx);

        scale_count = scale_list.length;
        scale_spacing = 50;
        scale_width = (scale_count + 2) * scale_spacing;
        legend_x_l = scale_spacing;
        legend_x_r = (scale_count + 1) * scale_spacing;

        // @ts-ignore
        canvas.width = scale_width - 5;
        // @ts-ignore
        canvas.height = welsh_labels ? 502 : 502 - lys;

        ctx.strokeStyle = "rgba(0,0,0,1.0)";
        ctx.drawTextCenter(20, scale_width / 2, scale_top / 2, title);

        // Chart border and T score legend
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,1.0)";
        ctx.lineWidth = 2;
        if (globalThis.chart_style === 1) {
            ctx.strokeRect(legend_x_l - 10, scale_top - 7, legend_x_r - legend_x_l + 20, (scale_bottom - scale_top) + 14);
            for (t = 30; t <= 120; t += 5) {
                y = t2y(t);
                if (t % 10) {
                    ctx.moveTo(legend_x_l - 10, y);
                    ctx.lineTo(legend_x_l - 4, y);
                    ctx.moveTo(legend_x_r + 4, y);
                    ctx.lineTo(legend_x_r + 10, y);
                } else {
                    ctx.moveTo(legend_x_l - 10, y);
                    ctx.lineTo(legend_x_l, y);
                    ctx.moveTo(legend_x_r, y);
                    ctx.lineTo(legend_x_r + 10, y);
                    ctx.stroke(); // excanvas requires this
                    ctx.drawTextRight(10, legend_x_l - 14, y + 5, "" + t);
                    ctx.drawText(10, legend_x_r + 14, y + 5, "" + t);
                    ctx.beginPath(); // excanvas requires this
                    ctx.strokeStyle = "rgba(0,0,0,1.0)";
                }
                if (t === 50 || t === 65) {
                    ctx.stroke();
                    ctx.beginPath();
                    //ctx.strokeStyle="rgba(0,0,0,0.2)";
                    ctx.strokeStyle = "rgba(0,255,0,0.3)";
                    ctx.moveTo(legend_x_l + 2, y);
                    ctx.lineTo(legend_x_r - 2, y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(0,0,0,1.0)";
                }
            }
        } else {
            ctx.strokeRect(10, scale_top - 7, scale_width - 16, (scale_bottom - scale_top) + 14);
            for (var t = 30; t <= 120; ++t) {
                y = t2y(t);
                if (t % 5) {
                    ctx.moveTo(legend_x_l - 8, y);
                    ctx.lineTo(legend_x_l, y);
                    ctx.moveTo(legend_x_r, y);
                    ctx.lineTo(legend_x_r + 8, y);
                } else {
                    ctx.moveTo(legend_x_l - 16, y);
                    ctx.lineTo(legend_x_l, y);
                    ctx.moveTo(legend_x_r, y);
                    ctx.lineTo(legend_x_r + 16, y);
                    ctx.stroke(); // excanvas requires this
                    ctx.drawTextRight(7, legend_x_l - 18, y + 3, "" + t);
                    ctx.drawText(7, legend_x_r + 18, y + 3, "" + t);
                    ctx.beginPath(); // excanvas requires this
                }
                if (t === 50 || t === 65) {
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(0,255,0,0.3)";
                    ctx.moveTo(legend_x_l + 2, y);
                    ctx.lineTo(legend_x_r - 2, y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(0,0,0,1.0)";
                }
            }
        }
        ctx.stroke();

        for (s = 0; s < scale_count; ++s) {
            x = (s + 1.5) * scale_spacing;
            si = scale_list[s];

            if (si === undefined) {
                ctx.beginPath();
                ctx.moveTo(x, scale_top);
                ctx.lineTo(x, scale_bottom);
                ctx.stroke();
                px = undefined;
                py = undefined;
            } else {
                sr = scales[si];

                draw_scale(ctx, globalThis.gender ? sr.t_scale.female : sr.t_scale.male, x);

                y = t2y(parseInt(sr.t_score || 30));

                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = "rgba(0,0,255,1.0)";
                ctx.arc(x, y, 5, 0, Math.PI * 2, false);
                ctx.fill();
                if (px && py) {
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(0,0,255,1.0)";
                    ctx.lineWidth = 4;
                    ctx.moveTo(px, py);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                px = x; py = y;
                ctx.restore();

                y = scale_bottom + 7 + lys;
                ctx.drawTextCenter(lth, x, y, sr.name);
                y += lys;
                if (welsh_labels) {
                    if (sr.welsh && sr.welsh !== sr.name) {
                        ctx.drawTextCenter(lth, x, y, sr.welsh);
                    }
                    y += lys;
                }
                ctx.drawTextCenter(lth, x, y, "" + sr.raw_score);
                y += lys;
                ctx.drawTextCenter(lth, x, y, "" + sr.t_score);
                y += lys;
                ctx.drawTextCenter(lth, x, y, "" + sr.response.toPrecision(3) + "%");
                ctx.stroke();
            }
        }
    }
}