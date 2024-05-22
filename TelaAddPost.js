import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Button, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from './Componentes/Header';
import firebase from './servicos/firebase';
import { getDatabase, ref as databaseRef, update } from 'firebase/database';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

const TelaAddPost = ({ navigation, route }) => {
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [postFailed, setPostFailed] = useState(false);
  const image = route.params.image ? route.params.image : null;

  const searchQuotes = async () => {
    let url;
    if (selectedTag.length === 0) {
      url = 'https://api.quotable.io/quotes/random';
    } else {
      url = `https://api.quotable.io/quotes?tags=${selectedTag}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      const database = getDatabase(firebase);
      const storage = getStorage(firebase);
      const postId = Date.now().toString();
      let imageUrl = '';

      if (image) {
        const imageRef = storageRef(storage, `images/${postId}.jpeg`);
        const imageData = await (await fetch(image)).blob();
        await uploadBytes(imageRef, imageData);
        imageUrl = await getDownloadURL(imageRef);
      }

      const userRef = databaseRef(database, `users/${route.params.uid}/posts/${postId}`);
      await update(userRef, {
        legenda: data.content,
        image: imageUrl,
      });

      console.log('Post criado:', data.content);
      setPostFailed(false);
      navigation.navigate('Posts', { uid: route.params.uid });
    } catch (error) {
      setPostFailed(true);
      console.error('Erro ao adicionar usuário:', error);
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('https://api.quotable.io/tags');
        const data = await response.json();
        setAvailableTags(data);
      } catch (error) {
        console.error('Erro ao buscar tags:', error);
      }
    };
    fetchTags();
  }, []);

  return (
    <View style={styles.container}>
      <Header showBackButton={true} navigation={navigation} route={route} />
      {postFailed && <Text style={styles.postFailed}>Falha ao enviar o post</Text>}
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <View style={styles.contentContainer}>
        <Button
          title="Tirar Foto"
          onPress={() => navigation.navigate('Camera', { uid: route.params.uid })}
        />
        <Picker
          selectedValue={selectedTag}
          onValueChange={(itemValue) => setSelectedTag(itemValue)}
        >
          <Picker.Item label="Selecione um tipo de legenda" value="" />
          {availableTags.map(tag => (
            <Picker.Item key={tag._id} label={tag.name} value={tag.name} />
          ))}
        </Picker>
        <Button
          title="Gerar post"
          onPress={searchQuotes}
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
    justifyContent: 'center',
    paddingHorizontal: 36,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'column',
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  postFailed: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default TelaAddPost;
