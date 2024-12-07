import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Marketplace = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showMarketTip, setShowMarketTip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarketTip = () => {
    setShowMarketTip(true);
    setTimeout(() => setShowMarketTip(false), 3000); // Auto-hide after 3 seconds
  };

  const categories = ['All', 'Recent', 'Vegetables', 'Fruits', 'Dairy', 'Grains'];

  const products = [
    { id: 1, name: 'Santol per kilo', price: '₱ 10.00', category: 'Fruits' },
    { id: 2, name: 'Dako nga Talong', price: '₱ 15.00', category: 'Vegetables' },
    { id: 3, name: 'Sili 2 kilo', price: '₱ 30.00', category: 'Vegetables' },
    { id: 4, name: 'Apple Mango', price: '₱ 120.00', category: 'Fruits' },
    { id: 5, name: 'Pineapple', price: '₱ 50.00', category: 'Fruits' },
    { id: 6, name: 'Potato', price: '₱ 40.00', category: 'Vegetables' },
  ];

  const filteredProducts =
    activeCategory === 'All'
      ? products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products.filter(
          (product) =>
            product.category === activeCategory &&
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <View style={styles.container}>
      {/* MarketTip Overlay */}
      {showMarketTip && (
        <View style={[styles.marketTipOverlay, styles.overlayPosition]}>
          <Text style={styles.marketTipText}>
            Here, you can browse products like{' '}
            <Text style={styles.boldHighlight}>Fruits</Text>,{' '}
            <Text style={styles.boldHighlight}>Vegetables</Text>, and more. Use the{' '}
            <Text style={styles.boldHighlight}>Search Bar</Text> to find items or filter by category for quick navigation.
          </Text>
        </View>
      )}

      {/* Main Content */}
      <View>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Welcome to Marketplace</Text>
          <TouchableOpacity onPress={handleMarketTip} style={styles.circleButton}>
            <Text style={styles.circleButtonText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search product"
            placeholderTextColor="#fff"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <TouchableOpacity style={styles.searchIconContainer}>
            <Ionicons name="search-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.fixedCategoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryFilter,
                  activeCategory === category && styles.activeCategoryFilter,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryFilterText,
                    activeCategory === category && styles.activeCategoryFilterText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        <ScrollView contentContainerStyle={styles.productsContainer}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.placeholderImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    left: 5,
  },
  circleButton: {
    width: 20,
    height: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },
  circleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  searchIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedCategoryContainer: {
    paddingBottom: 10,
    marginBottom: 8,
  },
  categoryFilterContainer: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'center',
  },
  categoryFilter: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 15,
  },
  activeCategoryFilter: {
    backgroundColor: '#4CAF50',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryFilterText: {
    color: '#fff',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '47%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  marketTipOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 9999,
  },
  overlayPosition: {
    top: 75,
    left: 10,
    right: 40,
  },
  marketTipText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
  },
  boldHighlight: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});

export default Marketplace;