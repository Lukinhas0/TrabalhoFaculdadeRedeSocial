import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Button, Text, TextInput } from 'react-native';
import Header from '../Componentes/Header';
import firebase from '../Servicos/firebase';
import { getDatabase, ref, update } from 'firebase/database';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

const TelaAddPost = ({ navigation, route }) => {
  const [customText, setCustomText] = useState('');
  const [postFailed, setPostFailed] = useState(false);
  const [location, setLocation] = useState(null);

  const image = route.params.image ? route.params.image : null;

  const uploadImage = async (image, postId) => {
    const storage = getStorage(firebase);
    const imageRef = storageRef(storage, 'images/' + postId + '.jpg');
    const imageData = await fetch(image).then((response) => response.blob());
    await uploadBytes(imageRef, imageData);
    return getDownloadURL(imageRef);
  };

  const createPost = async (legenda, imageUrl, location, uid, postId) => {
    const database = getDatabase(firebase);
    const userRef = ref(database, `users/${uid}/posts/${postId}`);
    return update(userRef, {
      legenda,
      foto: imageUrl,
      geolocalizacao: location,
    });
  };

  const savePost = async () => {
    const postId = Date.now().toString();

    if (customText.trim().length === 0) {
      setPostFailed(true);
      console.log('Texto personalizado está vazio');
      return;
    }

    try {
      const imageUrl = image ? await uploadImage(image, postId) : '';
      await createPost(customText, imageUrl, location, route.params.uid, postId);
      console.log('Post criado: ', customText);
      setPostFailed(false);
      navigation.navigate('posts', { uid: route.params.uid });
    } catch (error) {
      setPostFailed(true);
      console.error(error);
    }
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return (
        <View>
          <Text style={styles.postFailed}>Permissão de localização negada</Text>
        </View>
      );
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude });
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Header showNav={true} navigation={navigation} route={route} />
      {postFailed ? <Text style={styles.postFailed}>Falha ao enviar o post</Text> : null}
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
      <View style={styles.contentContainer}>
        <Button
          onPress={() => navigation.navigate('camera', { uid: route.params.uid })}
          title='Tirar Foto'
        />
        <TextInput
          style={styles.textInput}
          placeholder="Digite uma legenda personalizada"
          value={customText}
          onChangeText={(text) => setCustomText(text)}
        />
        <Button
          onPress={savePost}
          title="Gerar post"
          color="gray"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  postFailed: {
    color: 'red',
    fontWeight: 'bold',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default TelaAddPost;
