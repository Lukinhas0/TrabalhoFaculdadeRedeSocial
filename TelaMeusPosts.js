import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable, Image, ToastAndroid } from 'react-native';
import Header from '../Componentes/Header';
import firebase from '../Servicos/firebase';
import { getDatabase, ref, get, remove } from "firebase/database";

const TelaMeusPosts = ({ navigation, route }) => {
  const [posts, setPosts] = useState([]);
  const database = getDatabase(firebase);

  useEffect(() => {
    const userRef = ref(database, `users/${route.params.uid}`);
    get(userRef)
      .then((userSnapshot) => {
        const user = userSnapshot.val();
        if (user) {
          const allPosts = [];
          if (user.posts) {
            Object.keys(user.posts).forEach((postId) => {
              const post = user.posts[postId];
              allPosts.push({ postId, ...post });
            });
          }
          setPosts(allPosts);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar posts:', error);
        ToastAndroid.show('Erro ao buscar posts', ToastAndroid.SHORT);
      });
  }, [route.params]);

  const deletePost = (postId) => {
    Alert.alert(
      'Excluir Post',
      'Tem certeza que deseja excluir este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              const postRef = ref(database, `users/${route.params.uid}/posts/${postId}`);
              await remove(postRef);
              const novosPosts = posts.filter((post) => post.postId !== postId);
              setPosts(novosPosts);
              ToastAndroid.show('Post excluído com sucesso', ToastAndroid.SHORT);
            } catch (error) {
              console.error('Erro ao excluir post:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir o post.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header showNav={true} navigation={navigation} route={route} />
      </View>
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={({ item }) => (
            <View style={{ paddingTop: 10 }}>
              {item.foto && (<Image source={{ uri: item.foto }} style={styles.foto} />)}
              <View style={styles.postContainer}>
                <Text style={styles.container}>{item.legenda}</Text>
                <Pressable onPress={() => deletePost(item.postId)}>
                  <Image source={require('../assets/trash.png')} resizeMode="contain" style={styles.image} />
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userName: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  header: {
    flex: 0.25
  },
  image: {
    width: 48,
    height: 24
  },
  foto: {
    alignSelf: 'center',
    width: '80%',
    aspectRatio: 1
  }
});

export default TelaMeusPosts;
