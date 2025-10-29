import { LocalStorageService } from '../index';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    service = new LocalStorageService();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('应该获取存储的项', () => {
      const testData = { name: 'test', value: 123 };
      localStorage.setItem('testKey', JSON.stringify(testData));

      const result = service.getItem<typeof testData>('testKey');

      expect(result).toEqual(testData);
    });

    it('应该在项不存在时返回 null', () => {
      const result = service.getItem('nonExistentKey');

      expect(result).toBeNull();
    });

    it('应该处理不同类型的数据', () => {
      const stringData = 'test string';
      const numberData = 42;
      const booleanData = true;
      const arrayData = [1, 2, 3];
      const objectData = { a: 1, b: 2 };

      service.setItem('string', stringData);
      service.setItem('number', numberData);
      service.setItem('boolean', booleanData);
      service.setItem('array', arrayData);
      service.setItem('object', objectData);

      expect(service.getItem<string>('string')).toBe(stringData);
      expect(service.getItem<number>('number')).toBe(numberData);
      expect(service.getItem<boolean>('boolean')).toBe(booleanData);
      expect(service.getItem<number[]>('array')).toEqual(arrayData);
      expect(service.getItem<typeof objectData>('object')).toEqual(objectData);
    });

    it('应该在解析错误时返回 null', () => {
      localStorage.setItem('invalidJson', 'not a json');

      const result = service.getItem('invalidJson');

      expect(result).toBeNull();
    });

    it('应该在 localStorage 错误时返回 null', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = service.getItem('testKey');

      expect(result).toBeNull();
      spy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('应该存储项', () => {
      const testData = { name: 'test', value: 123 };

      service.setItem('testKey', testData);

      const stored = localStorage.getItem('testKey');
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('应该覆盖现有项', () => {
      service.setItem('testKey', 'old value');
      service.setItem('testKey', 'new value');

      const result = service.getItem<string>('testKey');
      expect(result).toBe('new value');
    });

    it('应该存储复杂对象', () => {
      const complexData = {
        name: 'test',
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      };

      service.setItem('complex', complexData);

      const result = service.getItem<typeof complexData>('complex');
      expect(result).toEqual(complexData);
    });

    it('应该处理 null 值', () => {
      service.setItem('nullValue', null);

      const result = service.getItem('nullValue');
      expect(result).toBeNull();
    });

    it('应该处理 undefined 值', () => {
      service.setItem('undefinedValue', undefined);

      const result = service.getItem('undefinedValue');
      expect(result).toBeNull();
    });

    it('应该在 localStorage 错误时静默处理', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        service.setItem('testKey', 'value');
      }).not.toThrow();

      spy.mockRestore();
    });
  });

  describe('removeItem', () => {
    it('应该删除项', () => {
      service.setItem('testKey', 'test value');
      service.removeItem('testKey');

      const result = service.getItem('testKey');
      expect(result).toBeNull();
    });

    it('应该在项不存在时不抛出错误', () => {
      expect(() => {
        service.removeItem('nonExistentKey');
      }).not.toThrow();
    });

    it('应该在 localStorage 错误时静默处理', () => {
      const spy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        service.removeItem('testKey');
      }).not.toThrow();

      spy.mockRestore();
    });
  });

  describe('clear', () => {
    it('应该清除所有项', () => {
      service.setItem('key1', 'value1');
      service.setItem('key2', 'value2');
      service.setItem('key3', 'value3');

      service.clear();

      expect(service.getItem('key1')).toBeNull();
      expect(service.getItem('key2')).toBeNull();
      expect(service.getItem('key3')).toBeNull();
    });

    it('应该在 localStorage 错误时静默处理', () => {
      const spy = jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        service.clear();
      }).not.toThrow();

      spy.mockRestore();
    });
  });

  describe('集成测试', () => {
    it('应该支持完整的 CRUD 操作', () => {
      // Create
      service.setItem('user', { id: 1, name: 'John' });
      expect(service.getItem('user')).toEqual({ id: 1, name: 'John' });

      // Update
      service.setItem('user', { id: 1, name: 'Jane' });
      expect(service.getItem('user')).toEqual({ id: 1, name: 'Jane' });

      // Delete
      service.removeItem('user');
      expect(service.getItem('user')).toBeNull();
    });

    it('应该独立处理多个键', () => {
      service.setItem('key1', 'value1');
      service.setItem('key2', 'value2');

      expect(service.getItem('key1')).toBe('value1');
      expect(service.getItem('key2')).toBe('value2');

      service.removeItem('key1');

      expect(service.getItem('key1')).toBeNull();
      expect(service.getItem('key2')).toBe('value2');
    });
  });
});
