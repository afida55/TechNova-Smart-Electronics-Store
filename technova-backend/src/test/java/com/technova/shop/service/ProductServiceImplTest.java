package com.technova.shop.service;

import com.technova.shop.dto.PageResult;
import com.technova.shop.dto.ProductQueryParams;
import com.technova.shop.entity.Product;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.ProductMapper;
import com.technova.shop.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void searchReturnsPagedResultWithCorrectMetadata() {
        ProductQueryParams params = new ProductQueryParams();
        params.setPage(2);
        params.setPageSize(10);

        Product p = new Product();
        p.setId(1L);
        p.setName("Nova Buds Pro");

        when(productMapper.search(params, 10, 10)).thenReturn(List.of(p));
        when(productMapper.count(params)).thenReturn(15L);

        PageResult<Product> result = productService.search(params);

        assertEquals(1, result.getList().size());
        assertEquals(15L, result.getTotal());
        assertEquals(2, result.getPage());
    }

    @Test
    void getByIdThrowsWhenProductMissing() {
        when(productMapper.findById(999L)).thenReturn(null);
        assertThrows(BusinessException.class, () -> productService.getById(999L));
    }
}
