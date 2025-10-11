import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';

export default function BuscarVideos() {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const defaultThumbnail = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    const categories = [
        { id: 'all', name: 'Tudo' },
        { id: 'caes', name: 'Cães' },
        { id: 'gatos', name: 'Gatos' },
        { id: 'cavalos', name: 'Cavalo' },
    ];

    const allVideos = {
        caes: [
            {
                id: 1,
                title: 'Comandos básicos para cães',
                thumbnail: defaultThumbnail,
                videoId: 'VIDEO_ID_1',
            },
            {
                id: 2,
                title: 'Como ensinar seu cachorro a sentar',
                thumbnail: defaultThumbnail,
                videoId: 'VIDEO_ID_2',
            },
        ],
        gatos: [
            {
                id: 3,
                title: 'Treinamento para gatos filhotes',
                thumbnail: defaultThumbnail,
                videoId: 'VIDEO_ID_3',
            },
            {
                id: 4,
                title: 'Como ensinar seu gato a usar a caixa de areia',
                thumbnail: defaultThumbnail,
                videoId: 'VIDEO_ID_4',
            },
        ],
        cavalos: [
            {
                id: 5,
                title: 'Adestramento básico para cavalos',
                thumbnail: defaultThumbnail,
                videoId: 'VIDEO_ID_5',
            },
            {
                id: 6,
                title: 'Como treinar cavalos jovens',
                thumbnail: defaultThumbnail,
                videoId: 'VIDEO_ID_6',
            },
        ],
    };

    const filteredVideos = selectedCategory === 'all' || !selectedCategory
        ? Object.values(allVideos).flat()
        : allVideos[selectedCategory] || [];

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.videosContainer}
                contentContainerStyle={styles.videosContentContainer}
            >
                <View style={styles.categoriesContainer}>
                    <View style={styles.categoriesContentContainer}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category.id && styles.selectedChip,
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.id && styles.selectedCategoryText,
                                    ]}
                                >
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {filteredVideos.map((video) => (
                    <TouchableOpacity
                        key={video.id}
                        style={styles.videoCard}
                        onPress={() => {
                            setSelectedVideo(video);
                            setModalVisible(true);
                        }}
                    >
                        <Image
                            source={{ uri: video.thumbnail }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                        <View style={styles.cardContent}>
                            <Text style={styles.videoTitle} numberOfLines={2}>
                                {video.title}
                            </Text>
                        </View>
                        <Ionicons
                            name="play-circle-outline"
                            size={24}
                            color="#4E2096"
                            style={styles.playIcon}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        {selectedVideo && (
                            <WebView
                                source={{ uri: `https://www.youtube.com/embed/${selectedVideo.videoId}` }}
                                style={styles.webview}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4e2096',
        marginLeft: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    categoriesContainer: {
        marginBottom: 10,
        paddingTop: 5,
    },
    categoriesContentContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryChip: {
        paddingHorizontal: 14,
        height: 34,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fea740',
        justifyContent: 'center',
        width: '23%',
        marginHorizontal: 2
    },
    selectedChip: {
        backgroundColor: '#fea740',
        borderColor: '#fea740',
    },
    categoryText: {
        fontSize: 13,
        color: '#fea740',
        fontWeight: '500',
        textAlign: 'center',
        includeFontPadding: false,
        flexWrap: 'nowrap',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    videosContainer: {
        flex: 1,
    },
    videosContentContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
    },
    videoCard: {
        borderWidth: 2,
        borderColor: '#4e2096',
        borderRadius: 15,
        marginBottom: 15,
        backgroundColor: '#F8F5F5',
        overflow: 'hidden',
        flexDirection: 'row',
        height: 100,
    },
    thumbnail: {
        width: 140,
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    videoTitle: {
        fontSize: 16,
        color: '#4e2096',
        fontWeight: 'bold',
        marginRight: 25,
    },
    playIcon: {
        position: 'absolute',
        right: 10,
        top: '50%',
        marginTop: -12,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '40%',
        backgroundColor: '#000',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 10,
    },
    webview: {
        flex: 1,
    },
});