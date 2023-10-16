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

const userHash = "0A26-9340-29CB-2480"
const server = "https://ips.navigine.com"
const locationId = 6
const sublocationId = 10

LocationView.init(userHash, server)

type State = {
    userPosition?: LocationPoint;
    route?: LocationPolyline;
    locationFinePermissionGranted: boolean;
    locationCoarsePermissionGranted: boolean;
    bluetoothPermissionGranted: boolean;
    storagePermissionGranted: boolean;
};

const initialState: State = {
    userPosition: undefined,
    route: undefined,
    locationFinePermissionGranted: false,
    locationCoarsePermissionGranted: false,
    bluetoothPermissionGranted: false,
    storagePermissionGranted: false,
};

export default class App extends React.Component<{}, State> {
    state = initialState;
    view = React.createRef<LocationView>();

    async componentDidMount(): Promise<void> {
        const statuses = await checkMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION])
        if (statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED) {
            this.setState({locationFinePermissionGranted: true});
        }
        if (statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED) {
            this.setState({locationCoarsePermissionGranted: true});
        }
        const btpermission = await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN)
        if (btpermission === RESULTS.GRANTED || btpermission == RESULTS.UNAVAILABLE) {
            this.setState({bluetoothPermissionGranted: true});
        }

        const stpermission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
        console.log(stpermission)
        if (stpermission === RESULTS.GRANTED || stpermission == RESULTS.UNAVAILABLE) {
            this.setState({storagePermissionGranted: true});
        }
    }

    requestLocationPermissions = async () => {
        const statuses = await checkMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION])
        if (statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== RESULTS.GRANTED) {
            if (await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) === RESULTS.GRANTED) {
                this.setState({locationFinePermissionGranted: true});
            }
        }

        if (statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] !== RESULTS.GRANTED) {
            if (await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION) === RESULTS.GRANTED) {
                this.setState({locationCoarsePermissionGranted: true});
            }
        }
    }

    requestBluetoothPermissions = async () => {
        if (await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN) !== RESULTS.GRANTED) {
            const permission = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN)
            if (permission === RESULTS.GRANTED || permission == RESULTS.UNAVAILABLE) {
                this.setState({bluetoothPermissionGranted: true});
            }
        }

        if (await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE) !== RESULTS.GRANTED) {
            const permission = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
            console.log(permission)
            if (permission === RESULTS.GRANTED || permission == RESULTS.UNAVAILABLE) {
                this.setState({storagePermissionGranted: true});
            }
        }
    };

    setLocationId = async () => {
        if (this.view.current) {
            this.view.current.setLocationId(locationId);
        }
    };

    setSublocationId = async () => {
        if (this.view.current) {
            this.view.current.setSublocationId(sublocationId);
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
        const currPoints: Polyline = points.filter(({ sublocationId }) => sublocationId === sublocationId).map(({ point }) => point);

        const route: LocationPolyline = {
            locationId: locationId,
            sublocationId: sublocationId,
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
            this.view.current.setTarget({ locationId: locationId, sublocationId: sublocationId, point: point });
        });
    };

    render() {
        return (
            <View style={styles.container}>
                {
                ((this.state.locationFinePermissionGranted && this.state.locationCoarsePermissionGranted && this.state.bluetoothPermissionGranted && this.state.storagePermissionGranted) === true) ?
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
                </LocationView> : <Text>Grant permissions, please</Text>}
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
