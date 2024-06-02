import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, Pressable } from 'react-native';
import { Camera } from 'expo-camera';
import Header from '../Componentes/Header';

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
  }, [route.params]);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setImage(data);
    }
  };

  const switchCamera = () => {
    setType(type === Camera.Constants.Type.back ? 
                         Camera.Constants.Type.front : Camera.Constants.Type.back);
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Permissao da Camera Negada!</Text>
      </View>
    )
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header showNav={false}/>
      </View>
        {image ? (
          <View style={styles.container2}>
            <Image source={{ uri: image.uri }} style={styles.image} />
              <Button
                  color='grey'
                  title='tirar nova foto'
                  onPress={()=>{
                    setImage(null)
                  }}
              />
            <Button
                title='Usar essa foto'
                onPress={()=>{
                  navigation.navigate('addPost', {uid: route.params.uid, image: image.uri})
                }}
            />
            </View>
          ) : (
          <View style={styles.container2}>
            <Camera
              ref={(ref)=> setCamera(ref)}
              style={styles.camera}
              type={type}
            >
            <View style={styles.BotoesCamera}>
              <Pressable onPress={()=> {switchCamera()}}>
                  <Image source={require('../assets/changeCamera.png')} resizeMode='contain'/>
              </Pressable>
            <Pressable onPress={()=>{takePicture()}}>
              <Image source={require('../assets/camera.png')} resizeMode="contain" />
            </Pressable>
              </View>
            </Camera>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    flex: 0.85,
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
});

export default TelaCamera;
