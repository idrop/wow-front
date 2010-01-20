if (!window.wave) {
    var wave = new Wave()
}

/**
 * wave object
 */
function Wave() {

    var state = new State()

    this.getParticipants = function() {
        var list = new Array()
        list[0] = new Participant("phil", "Phil Miller", "pic_url")
        list[1] = new Participant("dank", "Dank Spangle", "pic_url")
        list[2] = new Participant("wa", "Warren Miller", "pic_url")
        list[3] = new Participant("julie", "Julie Woodall", "pic_url")
        return list
    }

    this.isInWaveContainer = function() {
        return true
    };

    this.getHost = function() {
        return new Participant("phil", "Phil Miller", "pic_url")
    };

    this.getViewer = function() {
        return new Participant("phil", "Phil Miller", "pic_url")
    };

    this.getState = function() {
        return state
    };

    this.setStateCallback = function(fn) {

    };

    this.setParticipantCallback = function(fn) {

    };

}

/**
 * Participant object
 */
function Participant(id, name, pic) {
    this.id = id;
    this.name = name;
    this.pic = pic;

    this.getId = function() {
        return id
    }

    this.getName = function() {
        return name
    }

    this.getDisplayName = function() {
        return name
    }
}

/**
 * state object
 */
function State() {

    var state = new Array()

    this.get = function(key) {
        return state[key]
    };

    this.submitDelta = function(obj) {
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                state[prop] = obj[prop]
            }
        }
    };
}


if (!window.gadgets) {
    gadgets = {};
}

if (!gadgets.util) {
    gadgets.util = {
        registerOnLoadHandler : function(fn) {
            //callback immediately
            fn()

        }
    };
}


if (!gadgets.json) {
    gadgets.json = {
        parse : function(str) {
            return JSON.parse(str)
        }
    };
}

if (!gadgets.io) {
    gadgets.io = {

        registerOnLoadHandler : function(fn) {
            //callback immediately
            fn()

        },

        makeRequest : function(url, callback, params) {

            if (window.console) {
                console.info(url)
            }
            $.get(url, function(obj) {
                var json = new Object()
                json.data = JSON.parse(obj) // add property 'data' to this obj
                callback(json)
            })
        }
    };
}

if (!gadgets.io.RequestParameters) {
    gadgets.io.RequestParameters = {

        CONTENT_TYPE : "", METHOD : ""
    }
}

if (!gadgets.io.ContentType) {
    gadgets.io.ContentType = {

        JSON : ""
    }
}

if (!gadgets.io.MethodType) {
    gadgets.io.MethodType = {

        GET : ""
    }
}