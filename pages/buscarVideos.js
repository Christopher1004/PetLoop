import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
                videoId: 'dY8ajyiZgIY',
            },
        ],
        gatos: [
            {
                id: 3,
                title: 'Treinamento para gatos filhotes',
                thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                videoId: 'q0v2QCsCoWs',
            },
        ],
        cavalos: [
            {
                id: 5,
                title: 'Treinamento para cavalos',
                thumbnail: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                videoId: 'Ik1HynKt49s',
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
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        activeOpacity={1} 
                        style={styles.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                        {selectedVideo && Platform.OS === 'web' ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?playsinline=0`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                            />
                        ) : selectedVideo && (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: '#fff' }}>
                                    Abra no aplicativo móvel para visualizar o vídeo
                                </Text>
                            </View>
                        )}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
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
        padding: 20,
    },
    modalContent: {
        width: Platform.OS === 'web' ? '90%' : '100%',
        maxWidth: 1000,
        aspectRatio: 16/9,
        backgroundColor: '#000',
        position: 'relative',
        marginTop: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: Platform.OS === 'web' ? '5%' : 15,
        zIndex: 9999,
        padding: 8,
        backgroundColor: '#fea740',
        borderRadius: 50,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    webview: {
        flex: 1,
    },
});