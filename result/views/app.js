var app = angular.module('catsvsdogs', []);
var socket = io.connect();

app.controller('statsCtrl', function ($scope) {

    $scope.aPercent = 50;
    $scope.bPercent = 50;
    $scope.total = 0;

    socket.on('scores', function (json) {

        var data = JSON.parse(json);

        var a = parseInt(data.a || 0);
        var b = parseInt(data.b || 0);

        var percentages = getPercentages(a, b);

        $scope.$apply(function () {
            $scope.aPercent = percentages.a;
            $scope.bPercent = percentages.b;
            $scope.total = a + b;
        });

    });

});