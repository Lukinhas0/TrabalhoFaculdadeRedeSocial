import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Button, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../Componentes/Header';
import firebase from '../Servicos/firebase';
import { getDatabase, ref, update } from 'firebase/database';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

const TelaAddPost = ({ navigation, route }) => {
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [postFailed, setPostFailed] = useState(false);

  const image = route.params.image ? route.params.image : null;

  const searchQuotes = async () => {
    url = ""
    if (selectedTag.length === 0) {
      url = 'https://api.quotable.io/quotes/random';
    } else {
      url = `https://api.quotable.io/quotes?tags=${selectedTag}`;
    }

    fetch(url)
    .then((response) => response.json())
    .then(async (data) =>{
      const database = getDatabase(firebase)
      const storage = getStorage(firebase)
      const postId = Date.now().toString()
      var imageUrl = ''
      if(image){
        const imageRef = storageRef (storage, 'image/' + postId + ',jpg')
        const imageData = await fetch(image).then((response)=>response.blob())
        const uploadTask = await uploadBytes(imageRef, imageData)
        imageUrl = await getDownloadURL(imageRef)
      }
      const userRef = ref(database, 'users/'+route.params.uid+"/posts/"+postId)
      update(userRef, { legenda: data[0].content, foto: imageUrl })
      .then(()=>{
        console.log('Post criado: ', data[0].content);
        setPostFailed(false)
        navigation.navigate('posts', {uid: route.params.uid})
      })
      .catch((error)=>{
        setPostFailed(true)
        console.error("Erro ao adicionar Usuário: ", error);
      })
    })
    .catch((error)=>{
      setPostFailed(true)
      console.error(error)
    })
  };

  useEffect(() => {
    fetch('https://api.quotable.io/tags')
      .then((response)=>response.json())
      .then((data)=>{
        setAvailableTags(data);
      })
      .catch((error)=> console.error(error));
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
        <Picker
          selectedValue={selectedTag}
          onValueChange={(itemValue, itemIndex) => setSelectedTag(itemValue)}
        >
          <Picker.Item label="Selecione um tipo de legenda" value="" />
          {availableTags.map((tag) => (
            <Picker.Item key={tag._id} label={tag.name} value={tag.name} />
          ))}
        </Picker>
        <Button
          onPress={searchQuotes}
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
});

export default TelaAddPost;