angular.module('session', [])
    .factory('Session', function Session($rootScope) {
        return {
            setToken(token) {
                sessionStorage.token = token;
            },
            getToken() {
                return sessionStorage.token;
            },
            deleteToken() {
                delete sessionStorage.token;
            }
        };
    });

angular.module('socket', [])
    .factory('Socket', function($rootScope) {
        return {
            events: [],
            socket: null,
            init(nsp = '') {
                this.socket = io(location + nsp, {
                    reconnection: false
                });

                this.events.forEach(event => {
                    this.on.apply(undefined, event);
                });
            },
            on(eventName, callback) {
                if (this.socket != null) {
                    this.socket.on(eventName, () => {
                        const args = arguments;
                        $rootScope.$apply(() => {
                            callback.apply(undefined, args);
                        });
                    });
                } else {
                    this.events.push(arguments);
                }
            },
            emit(eventName, data, callback) {
                if (this.socket != null) {
                    this.socket.emit(eventName, data, () => {
                        const args = arguments;
                        $rootScope.$apply(() => {
                            if (callback != null) {
                                callback.apply(undefined, args);
                            }
                        });
                    });
                }
            }
        };
    });

angular.module('loginForm', ['session'])
    .component('loginForm', {
        templateUrl: 'login.html',
        controller: ['$rootScope', '$http', '$location', 'Session', function LoginFormController($rootScope, $http, $location, Session) {
            $rootScope.name = 'loginForm';

            this.status = null;
            this.username = '';
            this.password = '';
            this.onSubmit = () => {
                $http.post('/api/login', JSON.stringify({
                    username: this.username,
                    password: this.password
                })).then(res => {
                    const token = res.data.token;
                    $rootScope.token = token;
                    Session.setToken(token);
                    $location.url('/new');
                }).catch(err => {
                    this.status = err.status;
                });
            };

            if (Session.getToken()) {
                $location.url('/new');
            }
        }]
    });

angular.module('ticketAdd', [])
    .component('ticketAdd', {
        templateUrl: 'add.html',
        controller: ['$rootScope', '$http', '$location', function TicketAddController($rootScope, $http, $location) {
            $rootScope.name = 'ticketAdd';

            this.summary = '';
            this.priority = '';
            this.description = '';
            this.onSubmit = () => {
                $http.post('/api/tickets', JSON.stringify({
                    summary: this.summary,
                    priority: this.priority,
                    description: this.description,
                    token: $rootScope.token
                })).then(res => {
                    $location.url(`/tickets/${res.data.id}`);
                }).catch(err => {
                    console.error(err);
                });
            };
        }]
    });

angular.module('ticketList', [])
    .component('ticketList', {
        templateUrl: 'list.html',
        bindings: {
            filter: '='
        },
        controller: ['$rootScope', '$http', function TicketListController($rootScope, $http) {
            if (this.filter) {
                $rootScope.name = 'ticketNew';
                this.newFilter = {
                    status: 'NEW'
                };
            } else {
                $rootScope.name = 'ticketList';
                this.newFilter = () => true;
            }

            $http.get('/api/tickets')
                .then(response => {
                    this.tickets = response.data;
                });
        }]
    });

angular.module('ticketDetail', ['ngRoute'])
    .component('ticketDetail', {
        templateUrl: 'ticket.html',
        controller: ['$rootScope', '$http', '$routeParams', function TicketDetailController($rootScope, $http, $routeParams) {
            $rootScope.name = 'ticketDetail';

            $http.get('/api/tickets/' + $routeParams.ticket)
                .then(response => {
                    this.ticket = response.data;
                });
        }]
    });

angular.module('ticketEdit', ['ngRoute'])
    .component('ticketEdit', {
        templateUrl: 'edit.html',
        controller: ['$rootScope', '$http', '$routeParams', function TicketEditController($rootScope, $http, $routeParams) {
            $rootScope.name = 'ticketEdit';

            $http.get('/api/tickets/' + $routeParams.ticket)
                .then(response => {
                    this.ticket = response.data;
                });

            this.onSubmit = () => {
                console.log('Submit');
            };
        }]
    });

angular.module('trackApp', ['ngRoute', 'session', 'socket', 'loginForm', 'ticketAdd', 'ticketList', 'ticketDetail'])
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
            .when('/new', {
                template: '<ticket-list filter="true"></ticket-list>'
            })
            .when('/tickets/:ticket', {
                template: '<ticket-detail></ticket-detail>'
            })
            .when('/tickets/:ticket/edit', {
                template: '<ticket-edit></ticket-edit>'
            })
            .otherwise('/login');
    }])
    .controller('RootController', ['$rootScope', '$location', 'Session', 'Socket', function RootController($rootScope, $location, Session, Socket) {
        $rootScope.token = Session.getToken() || null;
        $rootScope.onLogout = () => {
            $rootScope.token = null;
            Session.deleteToken();
        };

        $rootScope.$on('$routeChangeStart', () => {
            if (!Session.getToken()) {
                $location.url('/login');
            }
        });

        Socket.init();
        $rootScope.notifications = [];
        Socket.on('new-post', () => {
            console.log(arguments);
            $rootScope.notifications.push('New ticket');
        });
        Socket.on('new-comment', () => {
            console.log(arguments);
            $rootScope.notifications.push('New comment');
        });
    }]);
