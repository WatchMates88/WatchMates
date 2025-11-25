import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Container } from '../../components/layout/Container';
import { SearchBar } from '../../components/search/SearchBar';
import { GenreBlock } from '../../components/search/GenreBlock';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { PosterGrid } from '../../components/media/PosterGrid';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { Movie, TVShow } from '../../types';

export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const movieGenres = await tmdbService.getMovieGenres();
      setGenres(movieGenres);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (text.length > 2) {
      try {
        setLoading(true);
        const [movieResults, tvResults] = await Promise.all([
          tmdbService.searchMovies(text),
          tmdbService.searchTVShows(text),
        ]);
        setSearchResults([...movieResults, ...tvResults]);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleGenrePress = async (genreId: number) => {
    try {
      setLoading(true);
      const results = await tmdbService.discoverMovies({ with_genres: genreId.toString() });
      setSearchResults(results);
      setSearchQuery('');
    } catch (error) {
      console.error('Error loading genre:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search movies & TV shows..."
      />

      {searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <SectionHeader title="Search Results" />
          <PosterGrid data={searchResults} onItemPress={(item) => console.log(item)} />
        </View>
      ) : (
        <View>
          <SectionHeader title="Browse by Genre" />
          <FlatList
            data={genres}
            renderItem={({ item }) => (
              <GenreBlock name={item.name} onPress={() => handleGenrePress(item.id)} />
            )}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
  },
});
