package com.appdevg5.technominds.Category;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for Category-related business logic.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // READ - all
    public List<CategoryEntity> getAllCategories() {
        return categoryRepository.findAll();
    }

    // READ - by id
    public Optional<CategoryEntity> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }

    // READ - by name
    public Optional<CategoryEntity> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    // CREATE
    @Transactional
    public CategoryEntity createCategory(CategoryEntity category) {
        // Business rule: ensure unique name
        if (category.getName() != null && categoryRepository.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category with the given name already exists");
        }
        return categoryRepository.save(category);
    }

    // UPDATE - replace name/description (partial updates allowed via caller)
    @Transactional
    public Optional<CategoryEntity> updateCategory(Integer id, CategoryEntity updates) {
        return categoryRepository.findById(id).map(existing -> {
            if (updates.getName() != null && !updates.getName().equals(existing.getName())) {
                // ensure new name is unique
                if (categoryRepository.existsByName(updates.getName())) {
                    throw new IllegalArgumentException("Category with the given name already exists");
                }
                existing.setName(updates.getName());
            }
            if (updates.getDescription() != null) {
                existing.setDescription(updates.getDescription());
            }
            return categoryRepository.save(existing);
        });
    }

    // DELETE
    @Transactional
    public void deleteCategory(Integer id) {
        categoryRepository.deleteById(id);
    }
}