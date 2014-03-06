/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var color = 0x100000;
var app = {
    // Application Constructor
    initialize: function() {
        app.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('bcready', app.onBCLReady, false);
        document.addEventListener('newdevice', app.addNewDevice, false);
        document.addEventListener('deviceconnected', app.onDeviceConnected, false);
		document.addEventListener('devicedisconnected', app.onBluetoothDisconnect, false);

    },
    onDeviceConnected : function(arg){
		var deviceID = arg.deviceID;
		//alert("device:"+deviceID+" is connected!");
	},
onBCLReady: function() {
    if(!BC.bluetooth.isopen){
        if(API !== "ios"){
            BC.Bluetooth.OpenBluetooth(function(){
                                       BC.Bluetooth.StartScan();
                                       });
        }else{
            alert("Please open your bluetooth first.");
        }
    }else{
        BC.Bluetooth.StartScan();
    }
},
addNewDevice: function(arg){
    var deviceID = arg.deviceID;
    var viewObj	= $("#user_view");
    var liTplObj=$("#li_tpl").clone();
    var newDevice = BC.bluetooth.devices[deviceID];
    $("a",liTplObj).attr("onclick","app.device_page('"+newDevice.deviceID+"')");
    
    liTplObj.show();
    for(var key in newDevice){
        if(key == "isConnected"){
            if(newDevice.isConnected){
                $("[dbField='"+key+"']",liTplObj).html("YES");
            }
            $("[dbField='"+key+"']",liTplObj).html("NO");
        }else{
            $("[dbField='"+key+"']",liTplObj).html(newDevice[key]);
        }
    }	
    
    viewObj.append(liTplObj);
    viewObj.listview("refresh");
},
device_page: function(deviceID){
    app.device = BC.bluetooth.devices[deviceID];
    $.mobile.changePage("device_detail.html","slideup");

},
onBluetoothDisconnect: function(arg){
    alert("device:"+arg.deviceID+" is disconnected!");
    $.mobile.changePage("index.html","slideup");
},
deviceViewInit: function(){
    $("#deviceName").html(app.device.deviceName);
    $("#deviceID").html(app.device.deviceID);
    //bind events
    $("#connect").click(app.connectDevice);
    $("#disconnect").click(app.disconnectDevice);
    $("#changeColor").show();
    $("#openLight").show();
    var isconnect = app.device.isConnected;
    if(!isconnect){
        app.connectDevice();
    }else{
        app.connectSuccess();
    }
},
connectDevice: function(){
    app.device.connect(app.connectSuccess);
},
	
connectSuccess: function(message){
    $("#disconnect").show();
    $("#connect").hide();
    var isconnect = app.device.isConnected;
    if(!isconnect){
        $("#connect").show();
    }else{
        $("#disconnect").show();
        app.getService();
    }
},
disconnectDevice: function(){
    app.device.disconnect(app.disconnectSuccess);
},
disconnectSuccess: function(message){
    $("#connect").show();
    $("#disconnect").hide();
},
openLight:function(){
    app.writeValue("3323CC");
    $("#openLight").hide();
    $("#closeLight").show();
},
closeLight:function(){
    app.writeValue("3324CC");
    $("#openLight").show();
    $("#closeLight").hide();
},
changeColor:function(){
    alert("changeColor");
    app.ischange = true;
    $("#changeColor").hide();
    $("#stopChange").show();
    app.concatenateString(color);
},
concatenateString:function(color){
    var strColor=color.toString(16);
    var colorStr = "aaf000"+strColor+"56";
    var character = app.device.services[3].characteristics[0];
    character.write("hex",colorStr,[],[]);
    interval_index =  window.setTimeout(function(){
                                        color = color+80;
                                        if(color >= 0xFFFFFF){
                                        color = 0x000001;
                                        }
                                        app.concatenateString(color);
                                        }, 1500);
},
stopChange:function(){
    app.ischange = false;
    $("#changeColor").show();
    $("#stopChange").hide();
    clearTimeout(interval_index);
},
lampBlink:function(){
    if(app.ischange){
        app.stopChange();
    }
    $.mobile.changePage("lampBlink.html","slideup");
},
lampBlinkViewInit:function(){
    app.getService();
},
getService:function(){
    app.device.discoverServices(app.getCharacter,[]);
},
getCharacter:function(){
    app.device.services[3].discoverCharacteristics([],[]);
},
    
loopBlink:function(){
    app.writeValue("441625BB");
},
redSlowBlink:function(){
    app.writeValue("441626BB");
},
greenSlowBlink:function(){
    app.writeValue("441627BB");
},
blueSlowBlink:function(){
    app.writeValue("441628BB");
},
yellowSlowBlink:function(){
    app.writeValue("441629BB");
},
writeValue:function(value){
    var character = app.device.services[3].characteristics[0];
    character.write("hex",value,[],[]);
},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

    }
};
