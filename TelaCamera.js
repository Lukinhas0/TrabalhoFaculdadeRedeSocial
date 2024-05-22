import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, Pressable } from 'react-native';
import { Camera } from 'expo-camera';
import Header from './Componentes/Header';

const TelaCamera = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setImage(data);
    }
  };

  const switchCamera = () => {
    setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Permissão da câmera negada!</Text>;
  }

  return (
    <View style={styles.container}>
      <Header showBackButton={false} />
      <View style={styles.container2}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.image} />
        ) : (
          <Camera
            ref={ref => setCamera(ref)}
            style={styles.camera}
            type={type}
            ratio={'1:1'}
          />
        )}
        <View style={styles.buttonContainer}>
          <Button
            color="gray"
            title="Tirar nova foto"
            onPress={takePicture}
          />
          {image && (
            <Button
              color="gray"
              title="Usar essa foto"
              onPress={() => navigation.navigate('AddPost', { uid: route.params.uid, image: image.uri })}
            />
          )}
          <Pressable onPress={switchCamera} style={styles.switchButton}>
            <Image source={require('./assets/changeCamera.png')} style={styles.icon} resizeMode="contain" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    flex: 0.83,
  },
  header: {
    flex: 0.15,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    padding: 20,
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  switchButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default TelaCamera;
