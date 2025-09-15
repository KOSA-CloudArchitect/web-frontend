'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { notificationService } from '../../services/notificationService';

interface NotificationSettings {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  webEnabled: boolean;
  priceDropEnabled: boolean;
  reviewChangeEnabled: boolean;
  analysisCompleteEnabled: boolean;
  priceDropThreshold: number;
  reviewChangeThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      setError('알림 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await notificationService.updateSettings(settings);
      setSettings(response.data);
      setSuccessMessage('알림 설정이 저장되었습니다.');
      
      // 성공 메시지를 3초 후 제거
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setError('알림 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async (type: 'PRICE_DROP' | 'REVIEW_CHANGE' | 'ANALYSIS_COMPLETE') => {
    try {
      await notificationService.sendTestNotification(type);
      setSuccessMessage(`테스트 알림이 전송되었습니다. (${type})`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      setError('테스트 알림 전송에 실패했습니다.');
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">설정을 불러올 수 없습니다</h2>
          <button
            onClick={loadSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">알림 설정</h1>
          <p className="mt-2 text-gray-600">
            관심 상품의 가격 변동 및 리뷰 변화 알림을 설정하세요.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* 알림 채널 설정 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">알림 채널</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">이메일 알림</h3>
                  <p className="text-sm text-gray-500">이메일로 알림을 받습니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">푸시 알림</h3>
                  <p className="text-sm text-gray-500">브라우저 푸시 알림을 받습니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushEnabled}
                    onChange={(e) => updateSetting('pushEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">웹 알림</h3>
                  <p className="text-sm text-gray-500">웹사이트에서 실시간 알림을 받습니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.webEnabled}
                    onChange={(e) => updateSetting('webEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 알림 유형 설정 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">알림 유형</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">가격 하락 알림</h3>
                  <p className="text-sm text-gray-500">관심 상품의 가격이 하락했을 때 알림을 받습니다.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTestNotification('PRICE_DROP')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    테스트
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.priceDropEnabled}
                      onChange={(e) => updateSetting('priceDropEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {settings.priceDropEnabled && (
                <div className="ml-4 pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 하락 임계값 ({settings.priceDropThreshold}%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.priceDropThreshold}
                    onChange={(e) => updateSetting('priceDropThreshold', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1%</span>
                    <span>50%</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">리뷰 변화 알림</h3>
                  <p className="text-sm text-gray-500">관심 상품의 리뷰가 변화했을 때 알림을 받습니다.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTestNotification('REVIEW_CHANGE')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    테스트
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.reviewChangeEnabled}
                      onChange={(e) => updateSetting('reviewChangeEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {settings.reviewChangeEnabled && (
                <div className="ml-4 pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    리뷰 변화 임계값 ({settings.reviewChangeThreshold}점)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={settings.reviewChangeThreshold}
                    onChange={(e) => updateSetting('reviewChangeThreshold', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1점</span>
                    <span>2.0점</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">분석 완료 알림</h3>
                  <p className="text-sm text-gray-500">관심 상품의 분석이 완료되었을 때 알림을 받습니다.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTestNotification('ANALYSIS_COMPLETE')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    테스트
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.analysisCompleteEnabled}
                      onChange={(e) => updateSetting('analysisCompleteEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  저장 중...
                </>
              ) : (
                '설정 저장'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}