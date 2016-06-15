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
                    this.socket.on(eventName, (...args) => {
                        $rootScope.$apply(() => callback(...args));
                    });
                } else {
                    this.events.push(arguments);
                }
            },
            emit(eventName, data, callback) {
                if (this.socket != null) {
                    this.socket.emit(eventName, data, (...args) => {
                        $rootScope.$apply(() => {
                            if (callback != null) {
                                callback(...args);
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
                }))
                    .then(res => {
                        const token = res.data.token;
                        $rootScope.token = token;
                        $rootScope.role = JSON.parse(atob(token.split('.')[1])).role;
                        Session.setToken(token);
                        $location.url('/new');
                    })
                    .catch(err => {
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
                }))
                    .then(res => {
                        $location.url(`/tickets/${res.data.id}`);
                    })
                    .catch(err => {
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
        controller: ['$rootScope', '$http', '$location', function TicketListController($rootScope, $http, $location) {
            if (this.filter) {
                $rootScope.name = 'ticketNew';
                this.newFilter = {
                    status: 'NEW'
                };
            } else {
                $rootScope.name = 'ticketList';
                this.newFilter = () => true;
            }

            this.showDetails = id => {
                $location.url(`/tickets/${id}`);
            };

            $http.get('/api/tickets')
                .then(response => {
                    this.tickets = response.data;
                });
        }]
    });

angular.module('ticketDetail', ['ngRoute'])
    .component('ticketDetail', {
        templateUrl: 'ticket.html',
        controller: ['$rootScope', '$http', '$routeParams', '$location', function TicketDetailController($rootScope, $http, $routeParams, $location) {
            $rootScope.name = 'ticketDetail';

            this.content = '';

            this.onSubmit = () => {
                const content = this.content;
                $http.post('/api/tickets/' + $routeParams.ticket, JSON.stringify({
                    content: this.content,
                    token: $rootScope.token
                }))
                    .then(res => {
                        this.ticket.comments.push(res.data);
                    })
                    .catch(err => {
                        console.error(err);
                    });
                this.content='';
            };

            this.onDelete = () => {
                $http.delete('/api/tickets/' + this.ticket._id)
                    .then(res => {
                        $location.url('/tickets');
                    })
                    .catch(err => {
                        console.error(err);
                    });

                return false;
            };

            this.onAssign = () => {
                const token = $rootScope.token;
                const {sub} = JSON.parse(atob(token.split('.')[1]));

                const ticket = this.ticket;
                if(ticket.status === 'NEW') {
                    ticket.status = 'IN PROGRESS';
                } else if (ticket.status === 'IN PROGRESS') {
                    ticket.status = 'DONE';
                }

                $http.patch('/api/tickets/' + ticket._id, JSON.stringify({
                    status: ticket.status,
                    developer: sub
                }))
                    .then(res => {
                        this.ticket = res.data;
                    })
                    .catch(err => {
                        console.error(err);
                    });

                return false;
            };

            $http.get('/api/tickets/' + $routeParams.ticket)
                .then(response => {
                    this.ticket = response.data;
                });
        }]
    });

angular.module('ticketEdit', ['ngRoute'])
    .component('ticketEdit', {
        templateUrl: 'edit.html',
        controller: ['$rootScope', '$http', '$routeParams', '$location', function TicketEditController($rootScope, $http, $routeParams, $location) {
            $rootScope.name = 'ticketEdit';

            $http.get('/api/tickets/' + $routeParams.ticket)
                .then(response => {
                    this.ticket = response.data;
                });

            this.onSubmit = () => {
                $http.patch('/api/tickets/' + this.ticket._id, JSON.stringify({
                    summary: this.ticket.summary,
                    priority: this.ticket.priority,
                    description: this.ticket.description,
                    token: $rootScope.token
                }))
                    .then(res => {
                        $location.url(`/tickets/${res.data._id}`);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            };
        }]
    });

angular.module('trackApp', ['ngRoute', 'session', 'socket', 'loginForm', 'ticketAdd', 'ticketList', 'ticketDetail', 'ticketEdit'])
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
    .controller('RootController', ['$rootScope', '$location', '$timeout', 'Session', 'Socket', function RootController($rootScope, $location, $timeout, Session, Socket) {
        $rootScope.token = Session.getToken() || null;
        if($rootScope.token !== null){
            $rootScope.role = JSON.parse(atob($rootScope.token.split('.')[1])).role;
            console.log($rootScope.role);
        }

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
        Socket.on('new-post', ticket => {
            const id = $rootScope.notifications.push(`${ticket.author.firstName} ${ticket.author.lastName} posted a new ticket`);
            $timeout(() => {
                $rootScope.notifications.splice(id - 1);
            }, 5000);
        });
        Socket.on('new-comment', comment => {
            const id = $rootScope.notifications.push(`${comment.author.firstName} ${comment.author.lastName} posted a new comment`);
            $timeout(() => {
                $rootScope.notifications.splice(id - 1);
            }, 5000);
        });
    }]);
