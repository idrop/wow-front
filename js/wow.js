var wow = new Wow()

/**
 * who-owes-who state object
 */
function Wow() {
    this.currs = new Array("USD", "GBP", "EUR", "CAD", "AUD", "CNY", "JPY", "KRW", "TWD")
    this.inited = false
    this.iousCode = null
    this.settlementsCode = null
}

function waveInit() {

    initErrorHandle()
    $("#tabs").tabs()

    if (wave && wave.isInWaveContainer()) {

        if (! wave.getViewer()) {
            setTimeout(waveInit, 200)
        } else {

            if (! wave.getState()) {
                setTimeout(waveInit, 200)
            } else {
                wave.setStateCallback(onWaveStateChange)
                wave.setParticipantCallback(onWaveParticipantChange)
                var wid = getWaveId()
                if (! wid) {
                    newWave()
                } else {
                    getCosts()
                }
            }
        }
    }
}

function getWaveId() {
    return wave.getState().get('wid')
}

function onWaveStateChange() {

}

function onWaveParticipantChange() {
    if (wow.inited) {
        msg("participantsChange", {
            wid: getWaveId(),
            uid : wave.getViewer().getId(),
            participants : getParticipantIds()
        }, write)
    } else {
        wow.inited = true
    }
}

function initErrorHandle() {
    $(this).ajaxError(function(event, request, settings) {
        clearError();
        showError(request.getResponseHeader("errorMsg"))
    });
}

function showError(msg) {
    showMsg(msg, "red")
}

function clearError() {
    clearMsg("red")
}

function showMsg(msg, klass) {
    var m = $("#msg")
    m.append(msg)
    m.append(makeCloseLink(function() {
        clearError()
    }))
    m.addClass(klass)
    m.show('slow')
}

function clearMsg(klass) {
    var m = $("#msg");
    if (m.contents() != null) {
        m.empty();
        m.removeClass(klass);
        m.hide();
    }
}

function newWave() {
    var wid = wave.getHost().getId() + "-" + new Date().getTime()
    log("new wave fired with id " + wid)
    msg("newWave", {
        wid : wid,
        uid : wave.getViewer().getId(),
        participants : getParticipantIds()
    }, write)
    wave.getState().submitDelta({
        wid : wid,
        test : "test"
    })
}

function getParticipantIds() {
    var friends = wave.getParticipants()
    var str = ""
    for (var i = 0; i < friends.length; i++) {
        str += (friends[i].getId() + ",")
    }
    return str.substring(0, str.length - 1)
}

function addEvent(event) {
    //event.active = true
    var outer = $("<div class='EventPanel ui-corner-all ui-widget'></div>")

    var options = $("<span style='float: right; display: none;'></span>")
    outer.append(options)
    $("#events").append(outer)


    //outer.append($("<b class='eventName'></b>").append("Wave"))
    //outer.append("<br/>")

    var active = function() {
        options.show()
        outer.find("a:not(#aon)").css({
            'color': 'blue',
            'text-decoration' : 'underline'
        })
        event.active = true
    }

    var inactive = function() {
        options.hide()
        outer.find("a:not(#aon)").css({
            'color': 'gray',
            'text-decoration' : 'none'
        })
        event.active = false
    }

    outer.hover(function() {
        active()
    }, function() {
        inactive()
    })

    if (event.active) {
        active()
    }

    table(outer, event)

}

function table(outer, event) {
    // write header row
    var table = $("<table></table>")
    outer.append(table)
    var header = $("<tr></tr>")
    table.append(header)
    var newCostCell = $("<td></td>")
    header.append(newCostCell)
    var newCostLink = $("<a href='#' id='aon'>Add Cost</a>")
    newCostCell.append(newCostLink)

    newCostLink.click(function(ev) {
        ev.preventDefault()
        newCostLink.toggle()
        var newCostEditDiv = $("<div class='green pad ui-corner-all'></div>")
        var newCostTxt = $("<b>Type in a Cost Name:</b><br/>")
        var newCostInput = $("<input type='text' />")
        var newCostSubmit = $("<input type='submit' value='Add' />")

        var newCostFn = function() {
            msg("newCost", {
                wid : getWaveId(),
                uid : wave.getViewer().getId(),
                name : encodeURI(newCostInput.val())
            }, write)
        }

        newCostSubmit.click(function() {
            newCostFn()
        })
        newCostInput.keyup(function(ev) {
            ev.preventDefault()
            if (ev.keyCode == 13) newCostFn()
        })

        var close = makeCloseLink(function() {
            newCostEditDiv.remove()
            newCostLink.toggle()
        })
        newCostEditDiv.append(newCostTxt).append(newCostInput).append(newCostSubmit).append(close)
        newCostCell.append(newCostLink).append(newCostEditDiv)
        newCostInput.focus()
    })


    // participants
    for (var p = 0; p < event.users.length; p++) {
        var headerCell = $("<td></td>")
        headerCell.append(getParticipantName(event.users[p]))
        header.append(headerCell)
    }


    // costs
    for (var i = 0; i < event.costs.length; i++) {
        var cost = event.costs[i]

        var costLink = $("<a href='#'>" + cost.name + "</a>")

        costLink.click(function(ev) {
            ev.preventDefault()
            $(this).toggle()
            showCostEdit(cost, $(this))

        })
        var row = $("<tr></tr>").append($("<td></td>").append(costLink))
        if (i % 2 == 0) {
            row.addClass("modRow")
        }
        table.append(row)
        for (var j = 0; j < event.users.length; j++) {
            var user = event.users[j]
            showPayments(row, cost, user)
        }
    }

}

function showCostEdit(cost, sibling) {

    var costEdit = $("<div class='green pad ui-corner-all'></div>")
    var costNameEdit = $("<input size='5' type='text' value='" + cost.name + "'/>")
    var costNameEditSubmit = $("<input type='submit' value='Update Name' />")
    var costDelete = $("<a href='#' class='close'>Delete</a>")
    var costEditClose = makeCloseLink(function() {
        costEdit.remove()
        sibling.toggle()
    })
    
    costEdit.append(costNameEdit).append(costNameEditSubmit).append(costDelete).append(costEditClose)
    costNameEdit.focus()
    sibling.parent().append(costEdit)

    costDelete.click(function(ev) {
        if (cost.creator != wave.getViewer().getId()) {
            showError("You cannot remove this Cost as you did not create it")
        }
        msg("deleteCost", {
            wid: getWaveId(),
            uid: wave.getViewer().getId(),
            cid : cost.id
        }, write)
    })

    costNameEditSubmit.click(function(ev) {
        ev.preventDefault()
        msg("updateCostName", {
            wid: getWaveId(),
            uid: wave.getViewer().getId(),
            cid : cost.id,
            name: costNameEdit.val()
        }, write)
    })

    costNameEdit.keyup(function(ev) {
        ev.preventDefault()
        if (ev.keyCode == 13) {
            msg("updateCostName", {
                wid: getWaveId(),
                uid: wave.getViewer().getId(),
                cid : cost.id,
                name: costNameEdit.val()
            }, write)
        }
    })


}

function showPayments(row, cost, user) {
    var payment = null
    for (var k = 0; k < cost.payments.length; k++) {
        if (cost.payments[k].user == user) {
            payment = cost.payments[k]
            break
        }
    }

    var td = $("<td></td>")
    row.append(td)
    var payment_link = $("<a href='#'></a>")
    if (payment) {

        if (payment.notInCost) {

            payment_link.append("<img src='" + wow_site + "img/user_off.png' alt='Not on this Cost' border=0>")
            payment_link.click(function(ev) {
                ev.preventDefault()
                msg("notParticipant", {
                    wid : getWaveId(),
                    uid : wave.getViewer().getId(),
                    userId : user,
                    costId : cost.id,
                    turn : 'off'
                }, write)

            })

        } else {

            var amt = payment.amount
            payment_link.append($("<b id='amount'></b>").append(amt + " " + payment.currency))

            payment_link.click(function(ev) {
                ev.preventDefault()
                $(td).children().toggle()
                amtInput.focus()

            })

        }


    } else {
        // no contribution
        payment_link.append("0")

        payment_link.click(function(ev) {
            ev.preventDefault()
            $(td).children().toggle()
            amtInput.focus()

        })
    }


    var amtInput = $("<input type='text' size='2' class='Amount'/>")
    amtInput.attr('value', amt)
    amtInput.keyup(function(ev) {
        ev.preventDefault()
        if (ev.keyCode == 13) {
            fn()
        }
    })

    var currSelect = $("<select class='Currency'></select>");
    for (var i = 0; i < wow.currs.length; i++) {
        currSelect.append($("<option></option>").attr("value", wow.currs[i]).append(wow.currs[i]));
    }

    var updateBtn = $("<input type='submit' value='Go' />")


    var notParticipant = $("<a id='notParticipant' href='#'><img src='" + wow_site + "img/user_off.png' border=0> Does Not Participate</a>")

    var close = makeCloseLink(function() {
        $(td).children().toggle()
    })

    notParticipant.click(function(ev) {
        ev.preventDefault()
        msg("notParticipant", {
            wid : getWaveId(),
            uid : wave.getViewer().getId(),
            userId : user,
            costId : cost.id,
            turn : 'on'
        }, write)
    })


    var payDiv = $("<div class='green pad ui-corner-all'></div>")
    payDiv.append(amtInput).append(currSelect).append(updateBtn).append("<br />").append(notParticipant).append(close)

    td.append(payment_link).append(payDiv)

    payDiv.hide()

    var fn = function() {
        var amt = Number($.trim($(amtInput).val()))
        if (isNaN(amt) || amt < 0) {
            showError("Please enter a positive number for this payment")
            return
        }
        var curr = currSelect.val()
        newAmt(user, cost.id, amt, curr)
    }
    updateBtn.click(fn)

}


function addEventCosts(div, event) {
    for (var i = 0; i < event.costs.length; i++) {
        var c = event.costs[i]
        var costDiv = $("<div id='cost'></div>")
        div.append(costDiv)
        if (c.name != null && c.name.length > 0) {
        }
        for (var j = 0; j < c.payments.length; j++) {
            var payment = c.payments[j]
            costDiv.append(payment.amount + " " + payment.currency + " paid by " + getParticipantName(payment.user) + " for ")
            if (c.name != null && c.name.length > 0) {
                costDiv.append(c.name)
            }
        }
    }

}


function newAmt(userId, costId, amt, curr) {
    msg("amt", {
        wid : getWaveId(),
        uid : wave.getViewer().getId(),
        userId : userId,
        costId : costId,
        amt : amt,
        curr : curr
    }, write)
}

function getParticipantName(participantId) {
    var friends = wave.getParticipants()
    var name = null
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].getId() == participantId) {
            name = friends[i].getDisplayName()
            break
        }
    }

    if (! name) {
        name = "Unknown"
    }
    return name
}

function getCosts() {
    msg("existingCosts", {
        wid : getWaveId(),
        uid : wave.getViewer().getId()
    }, write)
}

function nonZeroPayments(data) {

    var events = data[0]
    for (var i = 0; i < events.length; i++) {
        var costs = events[i].costs
        for (var j = 0; j < costs.length; j++) {
            var payments = costs[j].payments
            for (var k = 0; k < payments.length; k++) {
                if (Number(payments[k].amount) > 0) return true
            }
        }
    }

    var ious = data[1];
    return ious.length > 0
}

function write(arr) {
    wipeSlate()
    var data = arr.data
    if (!data) {
        showError("Oops, we've got a problem..")
    } else {
        writeEvents(data[0])
        writeIOUs(data)
        writeSettlements(data[2])
        $("#tabs").show()
    }

}

function writeSettlements(settlements) {
    var num = settlements.length
    if (num > 0) {
        var code = ""
        for (var i = 0; i < settlements.length; i++) {
            writeSettlement(settlements[i])
            code += settlements[i].id
        }
        if (code != wow.settlementsCode) {
            wow.settlementsCode = code
            $("li a[href='#settlements']").effect('highlight', {}, 5000)
        }
    } else {
        var div = $("<div class='iou ui-corner-all'></div>").append("<p>No current Settlements.</p>")
        $("#settlements").append(div)
    }


}

function writeSettlement(settlement) {

    var sDiv = $("<div class='settlement'></div>").attr('class', 'iou').append(getParticipantName(settlement.payer)).append(" settled ").append(settlement.amount).append(" with ").append(getParticipantName(settlement.payee)).append(" on ").append(settlement.date);
    $("#settlements").append(sDiv)
}

function writeIOUs(data) {

    var numIOUs = data[1].length;

    if (numIOUs == 0) {
        $("#ious").append($("<div class='iou ui-corner-all'></div>").append("No current IOUs."))
    } else {
        var ious = data[1];
        var code = ""
        for (var i = 0; i < ious.length; i++) {
            var iou = gadgets.json.parse(ious[i])
            writeIOU(iou)
            code += iou.id
        }
        if (code != wow.iousCode) {
            wow.iousCode = code
            $("li a[href='#ious']").effect('highlight', {}, 5000)
        }
    }


    if (nonZeroPayments(data)) {
        explain($("#ious"))
    }

    $("#ious").append("<div class='iou'><i>Powered by PayPal.</i> You may settle an IOU between two Google Wave Participants using PayPal. Any PayPal charges will be brought against the IOU ower. An additional charge of 50c (USD) will be levied by Who-owes-Who against the IOU ower.</div>")


}

function writeEvents(events) {
    for (var i = 0; i < events.length; i++) {
        addEvent(events[i]);
    }
}

function writeIOU(iou) {
    var ower = getParticipantName(iou.ower);
    var owed = getParticipantName(iou.owed);
    var iouDiv = $("<div class='iou ui-corner-all'></div>").append(ower).append(" owes ").append(owed).append(" ").append(iou.amount)

    if (iou.ower == wave.getViewer().getId()) {

        iouDiv.addClass("red");

        var pay = $("<a href='#' class='pay'>Settle this IOU with PayPal</a>").click(function(event) {
            event.preventDefault()
            pay.toggle()


            var paypalSubmit = $("<input type='submit' value='Pay'/>")


            var owerEmail = $("<input type='text' />")
            if (iou.owerpp) owerEmail.attr("value", iou.owerpp).attr("disabled", "disabled")

            var owedEmail = $("<input type='text' />")
            if (iou.owedpp) owedEmail.attr("value", iou.owedpp).attr("disabled", "disabled")

            var close = makeCloseLink(function() {
                paypal.remove()
                pay.toggle()
            })

            var paypal = $("<div class='green iou ui-corner-all'></div>")
            paypal.append("<b>Settle this IOU with PayPal</b><br/>")
                    .append(getParticipantName(iou.ower))
                    .append(" with PayPal email of ")
                    .append(owerEmail)
                    .append(" pays the amount of ")
                    .append(iou.amount)
                    .append(" to ")
                    .append(getParticipantName(iou.owed))
                    .append(" with PayPal email of ")
                    .append(owedEmail)
                    .append(paypalSubmit)
                    .append(close)


            paypalSubmit.click(function(ev) {
                ev.preventDefault()
                msg("settled", {
                    wid : getWaveId(),
                    uid : wave.getViewer().getId(),
                    payee : iou.owed,
                    owerEmail : owerEmail.val(),
                    owedEmail :owedEmail.val(),
                    amt : iou.amount
                }, write)
                paypal.remove() // remove this div
                showMsg("Contacting Payal..", "green")

            })

            iouDiv.append(paypal)

        })

        iouDiv.append(pay);
    } else if (iou.owed == wave.getViewer().getId()) {


        iouDiv.addClass("green");
    }

    $("#ious").append(iouDiv);
}

function makeCloseLink(fn) {
    var close = $("<a href='#' class='close'>Close</a>")
    close.click(function(ev) {
        ev.preventDefault()
        fn()
    })
    return close
}

function explain(dest) {
    var explainClick = $("<a href='#'>Explain the calculation..</a>")
    explainClick.click(function() {
        msg("explain", {
            uid : wave.getViewer().getId()
        }, writeExplanation)
    })
    dest.append(explainClick)
}

function writeExplanation(_data) {
    var data = _data.data
    $("#explain").remove()
    var explainDiv = $("<div id='explain' title='Explanation of Calculation' class='explain'></div>")
    for (var i = 0; i < data[0].length; i++) {
        var str = data[0][i];
        for (var j = 0; j < data[1].length; j++) {
            str = str.replace(new RegExp(data[1][j], "g"), getParticipantName(data[1][j]));
        }
        explainDiv.append($("<div id='explainRow' class='iou ui-corner-all blue'></div>").append((i + 1) + "). " + str));
    }

    $(explainDiv).dialog({
        height:300,
        width :300
    })
}


function wipeSlate() {
    clearError()
    $("#events").empty()
    $("#ious").empty()
    $("#settlements").empty()
}


/**
 * send an ajax msg to server
 */
function msg(endpoint, args, callback) {
    var params = {}
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET
    var url = wow_magic + endpoint + makeReqParams(args)
    log(url)
    makeCachedRequest(url, callback, params, 0)

}

function makeReqParams(params) {
    var str = "?"
    if (params) {
        for (k in params) {
            str += k + "=" + params[k] + "&"
        }
    }
    return str.substring(0, str.length - 1)
}

function makeCachedRequest(url, callback, params, refreshInterval) {
    var ts = new Date().getTime();
    var sep = "?";
    if (refreshInterval && refreshInterval > 0) {
        ts = Math.floor(ts / (refreshInterval * 1000));
    }
    if (url.indexOf("?") > -1) {
        sep = "&";
    }
    url = [ url, sep, "nocache=", ts ].join("");
    gadgets.io.makeRequest(url, callback, params);
}

function log(msg) {
    if (window.console) {
        window.console.info(msg)
    }
}
