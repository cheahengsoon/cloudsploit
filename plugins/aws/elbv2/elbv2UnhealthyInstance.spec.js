var expect = require('chai').expect;
const elbv2UnhealthyInstance = require('./elbv2UnhealthyInstance');

const describeLoadBalancers = [
    {
        "LoadBalancerArn": "arn:aws:elasticloadbalancing:us-east-1:111122223333:loadbalancer/app/ak-39/97b5a03b63cb8fad",
        "DNSName": "ak-39-1555922310.us-east-1.elb.amazonaws.com",
        "CanonicalHostedZoneId": "Z35SXDOTRQ7X7K",
        "CreatedTime": "2020-11-02T21:09:40.460Z",
        "LoadBalancerName": "ak-39",
        "Scheme": "internet-facing",
        "VpcId": "vpc-99de2fe4",
        "State": {
            "Code": "active"
        },
        "Type": "application",
        "AvailabilityZones": [
            {
                "ZoneName": "us-east-1a",
                "SubnetId": "subnet-06aa0f60",
                "LoadBalancerAddresses": []
            },
            {
                "ZoneName": "us-east-1b",
                "SubnetId": "subnet-673a9a46",
                "LoadBalancerAddresses": []
            },
            {
                "ZoneName": "us-east-1e",
                "SubnetId": "subnet-6a8b635b",
                "LoadBalancerAddresses": []
            },
            {
                "ZoneName": "us-east-1c",
                "SubnetId": "subnet-aac6b3e7",
                "LoadBalancerAddresses": []
            },
            {
                "ZoneName": "us-east-1f",
                "SubnetId": "subnet-c21b84cc",
                "LoadBalancerAddresses": []
            },
            {
                "ZoneName": "us-east-1d",
                "SubnetId": "subnet-e83690b7",
                "LoadBalancerAddresses": []
            }
        ],
        "SecurityGroups": [
            "sg-aa941691"
        ],
        "IpAddressType": "ipv4"
    }
];

const describeTargetGroups = [
    {
        "TargetGroups" : [
            {
                "TargetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:111122223333:targetgroup/ak-39/63d6e6082a3f6607",
                "TargetGroupName": "ak-39",
                "Protocol": "HTTP",
                "Port": 80,
                "VpcId": "vpc-99de2fe4",
                "HealthCheckProtocol": "HTTP",
                "HealthCheckPort": "traffic-port",
                "HealthCheckEnabled": true,
                "HealthCheckIntervalSeconds": 5,
                "HealthCheckTimeoutSeconds": 4,
                "HealthyThresholdCount": 2,
                "UnhealthyThresholdCount": 2,
                "HealthCheckPath": "/",
                "Matcher": {
                    "HttpCode": "200"
                },
                "LoadBalancerArns": [
                    "arn:aws:elasticloadbalancing:us-east-1:111122223333:loadbalancer/app/ak-39/97b5a03b63cb8fad"
                ],
                "TargetType": "instance"
            },
        ]
    },
];

const describeTargetHealth = [
    {
        "TargetHealthDescriptions": [
            {
                "Target": {
                    "Id": "i-0524e0662835a974b",
                    "Port": 80
                },
                "HealthCheckPort": "80",
                "TargetHealth": {
                    "State": "healthy",
                    "Reason": "Target.Timeout",
                    "Description": "Request timed out"
                }
            },
            {
                "Target": {
                    "Id": "i-077d08ab9b73d4a0c",
                    "Port": 80
                },
                "HealthCheckPort": "80",
                "TargetHealth": {
                    "State": "healthy",
                    "Reason": "Target.Timeout",
                    "Description": "Request timed out"
                }
            }
        ]
    },
    {
        "TargetHealthDescriptions": [
            {
                "Target": {
                    "Id": "i-0524e0662835a974b",
                    "Port": 80
                },
                "HealthCheckPort": "80",
                "TargetHealth": {
                    "State": "healthy",
                    "Reason": "Target.Timeout",
                    "Description": "Request timed out"
                }
            },
            {
                "Target": {
                    "Id": "i-077d08ab9b73d4a0c",
                    "Port": 80
                },
                "HealthCheckPort": "80",
                "TargetHealth": {
                    "State": "unhealthy",
                    "Reason": "Target.Timeout",
                    "Description": "Request timed out"
                }
            }
        ]
    },
    {
        "TargetHealthDescriptions": [
            {
                "Target": {
                    "Id": "i-0524e0662835a974b",
                    "Port": 80
                },
                "HealthCheckPort": "80",
                "TargetHealth": {
                    "State": "unhealthy",
                    "Reason": "Target.Timeout",
                    "Description": "Request timed out"
                }
            }
        ]
    }
];

const createCache = (elbv2, target, health) => {
    var lbDnsName = (elbv2 && elbv2.length) ? elbv2[0].DNSName : null;
    var targetArn = (target && target.TargetGroups) ? target.TargetGroups[0].TargetGroupArn : null;

    return {
        elbv2:{
            describeLoadBalancers: {
                'us-east-1': {
                    data: elbv2
                },
            },
            describeTargetGroups: {
                'us-east-1': {
                    [lbDnsName]: {
                        data: target
                    },
                },
            },
            describeTargetHealth: {
                'us-east-1': {
                    [targetArn]: {
                        data: health
                    },
                },
            },
        },
    };
};

const createErrorCache = () => {
    return {
        elbv2: {
            describeLoadBalancers: {
                'us-east-1': {
                    err: {
                        message: 'error describing Application/Network load balancers'
                    },
                },
            },
            describeTargetGroups: {
                'us-east-1': {
                    err: {
                        message: 'error describing Application/Network load balancer target groups'
                    },
                },
            },
            describeTargetHealth: {
                'us-east-1': {
                    err: {
                        message: 'error describing Application/Network load balancer target healths'
                    },
                },
            },
        }
    };
};

const createNullCache = () => {
    return {
        elbv2: {
            describeLoadBalancers: {
                'us-east-1': null,
            },
            describeTargetGroups: {
                'us-east-1': null,
            },
            describeTargetHealth: {
                'us-east-1': null,
            },
        },
    };
};

describe('elbv2UnhealthyInstance', function () {
    describe('run', function () {
        it('should PASS if Application/Network load balancer has healthy instances associated', function (done) {
            const cache = createCache([describeLoadBalancers[0]], describeTargetGroups[0], describeTargetHealth[0]);
            elbv2UnhealthyInstance.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].region).to.equal('us-east-1');
                expect(results[0].message).to.include('Application/Network load balancer does not have any unhealthy instance associated');
                done();
            });
        });

        it('should FAIL if Application/Network load balancer has unhealthy instance associated', function (done) {
            const cache = createCache([describeLoadBalancers[0]], describeTargetGroups[0], describeTargetHealth[1]);
            elbv2UnhealthyInstance.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(2);
                expect(results[0].region).to.equal('us-east-1');
                expect(results[0].message).to.include('Application/Network load balancer has an unhealthy instance associated');
                done();
            });
        });

        it('should PASS if no Application/Network load balancers found', function (done) {
            const cache = createCache([]);
            elbv2UnhealthyInstance.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].region).to.equal('us-east-1');
                expect(results[0].message).to.include('No Application/Network load balancers present');
                done();
            });
        });

        it('should FAIL if no Application/Network load balancer target groups found', function (done) {
            const cache = createCache([describeLoadBalancers[0]], [], describeTargetHealth[3]);
            elbv2UnhealthyInstance.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(2);
                expect(results[0].region).to.equal('us-east-1');
                expect(results[0].message).to.include('No Application/Network load balancer target groups found');
                done();
            });
        });

        it('should UNKNOWN if unable to describe Application/Network load balancers', function (done) {
            const cache = createErrorCache();
            elbv2UnhealthyInstance.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(3);
                expect(results[0].region).to.equal('us-east-1');
                expect(results[0].message).to.include('Unable to query for Application/Network load balancers');
                done();
            });
        });

        it('should UNKNOWN if unable to describe Application/Network load balancer target groups', function (done) {
            const cache = createCache([describeLoadBalancers[0]], null);
            elbv2UnhealthyInstance.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(3);
                expect(results[0].region).to.equal('us-east-1');
                expect(results[0].message).to.include('Unable to query for Application/Network load balancer target groups: ');
                done();
            });
        });

        it('should not return anything if describe Application/Network load balancers response is not found', function (done) {
            const cache = createNullCache();
            elbv2UnhealthyInstance.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(0);
                done();
            });
        });
    });
});