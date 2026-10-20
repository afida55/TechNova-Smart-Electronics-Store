package com.technova.shop.mapper;

import com.technova.shop.entity.Category;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface CategoryMapper {

    /*
     * ADMIN SIDE
     * Returns both active and deleted categories.
     */
    @Select("""
        SELECT *
        FROM category
        ORDER BY parent_id, id
    """)
    List<Category> findAll();

    /*
     * USER SIDE
     * Only active categories should appear in the store.
     */
    @Select("""
        SELECT *
        FROM category
        WHERE is_deleted = FALSE
        ORDER BY parent_id, id
    """)
    List<Category> findAllActive();

    /*
     * Active category only.
     */
    @Select("""
        SELECT *
        FROM category
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    Category findById(Long id);

    /*
     * ADMIN lookup.
     * Finds the category even if it has been deleted.
     */
    @Select("""
        SELECT *
        FROM category
        WHERE id = #{id}
    """)
    Category findAnyById(Long id);

    @Insert("""
        INSERT INTO category
            (name, parent_id, is_deleted)
        VALUES
            (#{name}, #{parentId}, FALSE)
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Category category);

    @Update("""
        UPDATE category
        SET
            name = #{name},
            parent_id = #{parentId}
        WHERE id = #{id}
    """)
    int update(Category category);

    /*
     * Soft delete.
     */
    @Update("""
        UPDATE category
        SET is_deleted = TRUE
        WHERE id = #{id}
    """)
    int deleteById(Long id);

    /*
     * Restore.
     */
    @Update("""
        UPDATE category
        SET is_deleted = FALSE
        WHERE id = #{id}
    """)
    int restoreById(Long id);
}