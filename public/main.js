angular.module('loginForm', [])
    .component('loginForm', {
        templateUrl: 'login.html',
        controller: function LoginFormController() {
            // TODO
        }
    });

angular.module('ticketList', [])
    .component('ticketList', {
        templateUrl: 'list.html',
        controller: ['$http', function TicketListController($http) {
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
            $http.get('/api/tickets/' + $routeParams.ticket)
                .then(response => {
                    this.ticket = response.data;
                });
        }]
    });

angular.module('trackApp', ['ngRoute', 'loginForm', 'ticketList', 'ticketDetail'])
    .config(['$locationProvider', '$routeProvider', function config($locationProvider, $routeProvider) {
        $routeProvider
            .when('/login', {
                template: '<login-form></login-form>'
            })
            .when('/tickets', {
                template: '<ticket-list></ticket-list>'
            })
            .when('/tickets/:ticket', {
                template: '<ticket-detail></ticket-detail>'
            })
            .otherwise('/tickets');
    }]);
