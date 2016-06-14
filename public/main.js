angular.module('loginForm', [])
    .component('loginForm', {
        templateUrl: 'login.html',
        controller: function LoginFormController() {
            this.name = 'loginForm';
        }
    });

angular.module('ticketAdd', [])
    .component('ticketAdd', {
        templateUrl: 'add.html',
        controller: function TicketAddController() {
            this.name = 'ticketAdd';
        }
    });

angular.module('ticketList', [])
    .component('ticketList', {
        templateUrl: 'list.html',
        controller: ['$http', function TicketListController($http) {
            this.name = 'ticketList';

            $http.get('/api/tickets')
                .then(response => {
                    this.tickets = response.data;
                });
        }]
    });

angular.module('ticketDetail', ['ngRoute'])
    .component('ticketDetail', {
        templateUrl: 'ticket.html',
        controller: ['$http', '$routeParams', function TicketDetailController($http, $routeParams) {
            this.name = 'ticketDetail';

            $http.get('/api/tickets/' + $routeParams.ticket)
                .then(response => {
                    this.ticket = response.data;
                });
        }]
    });

angular.module('ticketEdit', ['ngRoute'])
    .component('ticketEdit', {
        templateUrl: 'edit.html',
        controller: ['$http', '$routeParams', function TicketEditController($http, $routeParams) {
            this.name = 'ticketEdit';

            $http.get('/api/tickets/' + $routeParams.ticket)
                .then(response => {
                    this.ticket = response.data;
                });

            this.onSubmit = () => {
                console.log('Submit');
            };
        }]
    });

angular.module('trackApp', ['ngRoute', 'loginForm', 'ticketAdd', 'ticketList', 'ticketDetail'])
    .config(['$routeProvider', function config($routeProvider) {
        $routeProvider
            .when('/login', {
                template: '<login-form></login-form>'
            })
            .when('/add', {
                template: '<ticket-add></ticket-add>'
            })
            .when('/tickets', {
                template: '<ticket-list></ticket-list>'
            })
            .when('/tickets/:ticket', {
                template: '<ticket-detail></ticket-detail>'
            })
            .when('/tickets/:ticket/edit', {
                template: '<ticket-edit></ticket-edit>'
            });
    }])
    .controller('RootController', ['$scope', '$route', function RootController($scope, $route) {
        $scope.route = $route;
        $scope.$watch(scope => {
            if (scope.route.current !== undefined) {
                if (scope.route.current.scope.$$childHead !== null) {
                    return scope.route.current.scope.$$childHead.$ctrl.name;
                }
                return scope.route.current.scope.name;
            }
            return scope.route.current;
        }, name => {
            $scope.name = name;
        }, true);
    }]);
