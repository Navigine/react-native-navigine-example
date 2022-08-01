import React from 'react';
import {
    PermissionsAndroid,
    Button,
    Image,
    NativeSyntheticEvent,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';

import {
    IconMapObject,
    PolylineMapObject,
    CircleMapObject,
    Animation,
    Position,
    Point,
    LocationPoint,
    RoutePath,
    LocationPolyline,
    Polyline
} from 'react-native-navigine'

import LocationView from 'react-native-navigine';
import { USER } from './images';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    locationView: {
        flex: 1,
    }
});

LocationView.init("USER_HASH", "https://ips.navigine.com");

type State = {
    userPosition?: LocationPoint;
    route?: LocationPolyline;
};

const initialState: State = {
    userPosition: undefined,
    route: undefined,
};

export default class App extends React.Component<{}, State> {
    state = initialState;
    view = React.createRef<LocationView>();

    async requestPermissions() {
        const chckLocationPermission = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (chckLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
            alert("You've access for the location");
        } else {
            try {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        'title': 'Cool Location App required Location permission',
                        'message': 'We required Location permission in order to get device location ' +
                            'Please grant us.'
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    alert("You've access for the location");
                } else {
                    alert("You don't have access for the location");
                }
            } catch (err) {
                alert(err)
            }
        }
        const chckBtPermission = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        if (chckBtPermission === PermissionsAndroid.RESULTS.GRANTED) {
            alert("You've access for the bluetooth");
        } else {
            try {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    {
                        'title': 'Cool Navigine React Native App required BLUETOOTH_SCAN permission',
                        'message': 'We required BLUETOOTH_SCAN permission in order to get bt scan results ' +
                            'Please grant us.'
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    alert("You've access for the bluetooth");
                } else {
                    alert("You don't have access for the bluetooth");
                }
            } catch (err) {
                alert(err)
            }
        }
    };

    setLocationId = async () => {
        if (this.view.current) {
            this.view.current.setLocationId(6);
        }
    };

    setSublocationId = async () => {
        if (this.view.current) {
            this.view.current.setSublocationId(10);
        }
    };

    onPositionUpated = async (event: NativeSyntheticEvent<Position>) => {
        const { locationId, sublocationId, point } = event.nativeEvent;

        const userPosition = {
            locationId,
            sublocationId,
            point,
        };
        this.setState({
            userPosition: userPosition,
        });
    };

    onPathsUpdated = async (event: NativeSyntheticEvent<RoutePath>) => {
        const { length, events, points } = event.nativeEvent;
        const currPoints: Polyline = points.filter(({ sublocationId }) => sublocationId === 10).map(({ point }) => point);

        const route: LocationPolyline = {
            locationId: 6,
            sublocationId: 10,
            polyline: currPoints,
        }
        this.setState({
            route
        });
    };

    onMapPress = (event: NativeSyntheticEvent<Point>) => {
        const { x, y } = event.nativeEvent;
    };

    onMapLongPress = (event: NativeSyntheticEvent<Point>) => {
        const { x, y } = event.nativeEvent;
        this.view.current.screenPositionToMeters({ x, y }, (point: Point) => {
            this.view.current.setTarget({ locationId: 6, sublocationId: 10, point: point });
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <LocationView
                    ref={this.view}
                    style={styles.locationView}
                    onPositionUpated={this.onPositionUpated}
                    onPathsUpdated={this.onPathsUpdated}
                    onMapPress={this.onMapPress}
                    onMapLongPress={this.onMapLongPress}>
                    {this.state.userPosition ? (
                        <>
                            <IconMapObject
                                locationPoint={this.state.userPosition}
                                source={USER}
                                size={{
                                    width: 22,
                                    height: 22,
                                }}
                                styling={'{ order: 1, collide: false}'}
                                visible={true}
                                interactive={true}
                            />
                            </>
                    ) : null}
                    {this.state.route ? (
                        <>
                        <PolylineMapObject
                            polyline={this.state.route}
                            lineWidth={3}
                            lineColor='#0000ff80'/>
                        </>
                    ) : null}
                </LocationView>
                <Button
                    title="Get Permissions (Android)"
                    color="#231234"
                    onPress={this.requestPermissions}
                />
                <Button
                    title="Set Location ID"
                    color="#231234"
                    onPress={this.setLocationId}
                />
                <Button
                    title="Set Sublocation ID"
                    color="#231234"
                    onPress={this.setSublocationId}
                />
            </View>
        );
    }
}
