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

import RNPermissions, {check, request, RESULTS, PERMISSIONS, checkMultiple} from 'react-native-permissions';

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

    async requestLocationPermissions() {
        const statuses = await checkMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION])
        console.log(statuses)
        if (statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== RESULTS.GRANTED) {
            if (await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) === RESULTS.DENIED) {
                alert("You don't access for the ACCESS_FINE_LOCATION");
            }
        }

        if (statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] !== RESULTS.GRANTED) {
            if (await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION) === RESULTS.DENIED) {
                alert("You don't access for the ACCESS_COARSE_LOCATION");
            }
        }


    }

    async requestBluetoothPermissions() {
        if (await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN) !== RESULTS.GRANTED) {
            if (await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN) === RESULTS.DENIED) {
                alert("You don't access for the BLUETOOTH_SCAN");
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

    onPositionUpdated = async (event: NativeSyntheticEvent<Position>) => {
        const { point, accuracy, heading, locationPoint, locationHeading} = event.nativeEvent;

        this.setState({
            userPosition: locationPoint,
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
                    onPositionUpdated={this.onPositionUpdated}
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
                    title="Get location Permissions (Android)"
                    color="#231234"
                    onPress={this.requestLocationPermissions}
                />
                <Button
                    title="Get bluetooth Permissions (Android)"
                    color="#231234"
                    onPress={this.requestBluetoothPermissions}
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
