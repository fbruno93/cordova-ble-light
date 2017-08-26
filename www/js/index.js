angular.element(document).ready(function () { angular.bootstrap(document, ['app']); });

angular.module('app', ['ionic'])
.run(function($rootScope) {
    var def = {
        mode: 0,
        leds: 4,
        speed: 50,
        red: 0,
        green: 0,
        blue: 255
    };
    var conf = localStorage.getItem('conf')
    if (conf == null)
        $rootScope.conf = def;
    else 
        $rootScope.conf = JSON.parse(conf);
    console.log($rootScope.conf);
})
.controller('ctrl', function($scope, $timeout, $ionicSideMenuDelegate, $rootScope, $ionicLoading) {

    var service_uuid = '0000b2f0-0000-1000-8000-00805f9b34fb';
    var characteristic_uuid = '0000b2f1-0000-1000-8000-00805f9b34fb';
    var device;

    $scope.conf = angular.copy($rootScope.conf);
    
    var r = $scope.conf.red.toString(16)
    r = r.length > 1 ? r : '0' + r;
    var g = $scope.conf.green.toString(16)
    g = g.length > 1 ? g : '0' + g;
    var b = $scope.conf.blue.toString(16)
    b = b.length > 1 ? b : '0' + b;

    $scope.col = '#' + r + g + b;

    $scope.modes = [{
        name: 'Wheel Color',
        color: false,
        leds: false,
        speed: true,
        value: 6
    }, {
        name: 'Multi Color',
        color: false,
        leds: false,
        speed: true,
        value: 1
    }, {
        name: 'Blinking',
        color: true,
        leds: false,
        speed: true,
        value: 2
    },{
        name: 'Counter',
        color: true,
        leds: false,
        counter: true,
        value: 3
    },{
        name: 'Snake',
        color: true,
        leds: true,
        speed: true,
        value: 4
    }, {
        name: 'Stop',
        value: 5,
        color: true,
        leds: true,
        speed: true,
    }, {
        name: 'Color',
        value: 0,
        color: true,
        leds: false,
        speed: false,
    }];

    $scope.mode    = $scope.modes[$scope.conf.mode];
    $scope.mo      = $scope.mode.name
    $scope.devices = [];

    $timeout(function() {
        ble.startScan([], function(d) {
            if (d.name !== undefined 
                && d.name.toLowerCase().indexOf('iron') !== -1
            ) {
                    $scope.devices.push(d);
                }
            $scope.$apply();
        }, function(e) {
            console.warn(e)
        });

    }, 1500);

    $scope.sendConf = function() {

        var array = new Uint8Array(6);
        array[0] = $scope.conf.mode;
        array[1] = $scope.conf.red;
        array[2] = $scope.conf.green;
        array[3] = $scope.conf.blue;
        array[4] = $scope.conf.speed;
        array[5] = $scope.conf.leds;

        if (device === undefined) {
            alert("please connect on device");
            $ionicSideMenuDelegate.toggleRight();
        } else 
            ble.writeWithoutResponse(device.id, service_uuid, characteristic_uuid, array.buffer, console.log, alert);
    };

    $scope.connect = function(dev) {
        $ionicLoading.show({
            template: 'Connection...',
        });

        ble.connect(dev.id, function(s) {
            console.log(s);
            device = dev;
            $ionicLoading.hide();
            $ionicSideMenuDelegate.toggleRight();
            $scope.$apply();
        }, function(e) {
            console.warn(e)
            alert("Please retry to connect");
            alert(JSON.stringify(e));
            $ionicLoading.hide();
            $scope.$apply();
        });
    };

    $scope.changeConf = function(mode, value) {

        switch (mode) {
            case 'color':
                var rgb = value.slice(1);
                $scope.conf.red   = parseInt(rgb[0] + rgb[1], 16);
                $scope.conf.green = parseInt(rgb[2] + rgb[3], 16);
                $scope.conf.blue  = parseInt(rgb[4] + rgb[5], 16);
            break;
            case 'mode':
                for (var i = 0 ; i < $scope.modes.length ; i++)
                    if (value == $scope.modes[i].name) {
                        $scope.mode = $scope.modes[i];
                        $scope.conf['mode'] = $scope.mode.value;
                    }
            break;
            default:
                $scope.conf[mode] = value
                
        }

        localStorage.setItem('conf', JSON.stringify($scope.conf));
    };
});
