/**
 * Supabase Service
 * Core service for interacting with Supabase database
 */
import { supabase } from '@/lib/supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

class SupabaseService {
  /**
   * Get a reference to a Supabase table
   * @param tableName - The name of the table to reference
   * @returns Supabase query builder for the table
   */
  table(tableName: string) {
    return supabase.from(tableName);
  }

  /**
   * Perform a SELECT query on a table
   * @param tableName - The name of the table
   * @param columns - Columns to select
   * @param filters - Query filters/conditions
   * @returns Query result
   */
  async select(tableName: string, columns: string | string[] = '*', filters: Record<string, any> = {}) {
    let query = this.table(tableName).select(columns);

    // Apply filters if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value) as PostgrestFilterBuilder<any, any, any>;
      }
    });

    return query;
  }

  /**
   * Insert a record into a table
   * @param tableName - The name of the table
   * @param data - Data to insert
   * @param returnRecord - Whether to return the inserted record
   * @returns Insert result
   */
  async insert(tableName: string, data: Record<string, any>, returnRecord: boolean = true) {
    let query = this.table(tableName).insert(data);

    if (returnRecord) {
      query = query.select();
    }

    return query;
  }

  /**
   * Update a record in a table
   * @param tableName - The name of the table
   * @param data - Data to update
   * @param filters - Query filters/conditions
   * @param returnRecord - Whether to return the updated record
   * @returns Update result
   */
  async update(tableName: string, data: Record<string, any>, filters: Record<string, any>, returnRecord: boolean = true) {
    let query = this.table(tableName).update(data);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value) as PostgrestFilterBuilder<any, any, any>;
      }
    });

    if (returnRecord) {
      query = query.select();
    }

    return query;
  }

  /**
   * Delete a record from a table
   * @param tableName - The name of the table
   * @param filters - Query filters/conditions
   * @returns Delete result
   */
  async delete(tableName: string, filters: Record<string, any>) {
    let query = this.table(tableName).delete();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value) as PostgrestFilterBuilder<any, any, any>;
      }
    });

    return query;
  }

  /**
   * Get a single record from a table
   * @param tableName - The name of the table
   * @param id - Record ID
   * @param columns - Columns to select
   * @returns Query result
   */
  async getById(tableName: string, id: string, columns: string | string[] = '*') {
    return this.table(tableName)
      .select(columns)
      .eq('id', id)
      .single();
  }

  /**
   * Execute a stored function
   * @param functionName - The name of the function
   * @param params - Function parameters
   * @returns Function result
   */
  async rpc(functionName: string, params: Record<string, any> = {}) {
    return supabase.rpc(functionName, params);
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
