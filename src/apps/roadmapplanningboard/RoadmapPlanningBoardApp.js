(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.RoadmapPlanningBoardApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.apps.roadmapplanningboard.PlanningGridBoard',
            'Rally.apps.roadmapplanningboard.plugin.RoadmapScrollable',
            'Rally.apps.roadmapplanningboard.AppModelFactory'
        ],
        cls: 'roadmapPlanningBoardApp',
        componentCls: 'app',
        cardboard: null,

        constructor: function(config) {
            if (!config.settings.test) { // For now we have app-level Deft.Injector.configure
                Deft.Injector.configure({
                    timeframeStore: {
                        className: 'Ext.data.Store',
                        parameters: [{
                            model: Rally.apps.roadmapplanningboard.AppModelFactory.getTimeframeModel()
                        }]
                    },
                    planStore: {
                        className: 'Ext.data.Store',
                        parameters: [{
                            model: Rally.apps.roadmapplanningboard.AppModelFactory.getPlanModel()
                        }]
                    },
                    roadmapStore: {
                        className: 'Ext.data.Store',
                        parameters: [{
                            model: Rally.apps.roadmapplanningboard.AppModelFactory.getRoadmapModel()
                        }]
                    }
                });
            }
            this.mergeConfig(config);
            this.callParent([this.config]);

            Ext.Ajax.on('requestexception', this.onRequestException, this);
        },

        onRequestException: function(connection, response, requestOptions) {
            if (requestOptions.operation.requester === this || requestOptions.operation.requester.up('rallyapp')) {
                this.getEl().mask('Roadmap planning is <strong>temporarily unavailable</strong>, please try again in a few minutes.', "roadmap-service-unavailable-error");
            }
         },

        launch: function () {

            roadmapStore = Deft.Injector.resolve('roadmapStore');

            roadmapStore.load({
                callback: function(records, operation, success) {
                    if (success) {
                        this.cardboard = Ext.create('Rally.apps.roadmapplanningboard.PlanningBoard', {
                            roadmapId: roadmapStore.first() ? roadmapStore.first().getId() : undefined,
                            plugins: [
                                {
                                    ptype: 'rallytimeframescrollablecardboard', timeframeColumnCount: 4
                                },
                                {
                                    ptype: 'rallyfixedheadercardboard'
                                }
                            ]
                        });
                        this.add(this.cardboard);
                    }
                },
                requester: this,
                scope: this
            });
        }
    });

}).call(this);