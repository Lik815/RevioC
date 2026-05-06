import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getBaseUrl, RADIUS, SHADOW, SPACE, TUNNEL_HEADERS, TYPE } from './mobile-utils';

export function PatientDashboardScreen({ c, loggedInPatient, styles, t, authToken, onProfileSaved }) {
  const firstName = loggedInPatient?.firstName ?? '';
  const lastName = loggedInPatient?.lastName ?? '';
  const email = loggedInPatient?.email ?? '';
  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?';

  const [editing, setEditing] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const openEdit = () => {
    setEditFirst(firstName);
    setEditLast(lastName);
    setSaveError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError('');
  };

  const saveEdit = async () => {
    if (!editFirst.trim()) { setSaveError(t('firstNameRequired')); return; }
    if (!editLast.trim()) { setSaveError(t('lastNameRequired')); return; }
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${getBaseUrl()}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...TUNNEL_HEADERS, Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ firstName: editFirst.trim(), lastName: editLast.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setSaveError(data.message ?? 'Fehler beim Speichern.'); return; }
      onProfileSaved({ firstName: data.firstName, lastName: data.lastName });
      setEditing(false);
    } catch {
      setSaveError('Verbindungsfehler.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 16, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero-Karte ──────────────────────────────────────────────── */}
      <View style={[styles.practiceHeader, { backgroundColor: c.card, borderColor: c.border, alignItems: 'center' }]}>
        <View style={[styles.therapistAvatarLarge, { borderRadius: 48, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>{initials}</Text>
        </View>
        <Text style={[styles.practiceHeaderName, { color: c.text, marginTop: 10 }]}>
          {firstName} {lastName}
        </Text>
        <Text style={[styles.practiceHeaderCity, { color: c.textMuted ?? c.muted }]}>
          {t('patientRoleLabel')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm, marginTop: SPACE.sm, width: '100%' }}>
          <View style={{ flex: 1, minWidth: '45%', borderWidth: 1, borderColor: c.border, borderRadius: RADIUS.md, padding: SPACE.md, gap: SPACE.xs, backgroundColor: c.card }}>
            <Ionicons name="mail-outline" size={18} color={c.muted} />
            <Text style={{ ...TYPE.label, color: c.textMuted ?? c.muted }}>{t('emailLabel')}</Text>
            <Text style={{ ...TYPE.meta, color: c.text, fontWeight: '600' }} numberOfLines={1}>{email}</Text>
          </View>
          <View style={{ flex: 1, minWidth: '45%', borderWidth: 1, borderColor: c.border, borderRadius: RADIUS.md, padding: SPACE.md, gap: SPACE.xs, backgroundColor: c.card }}>
            <Ionicons name="person-outline" size={18} color={c.success} />
            <Text style={{ ...TYPE.label, color: c.textMuted ?? c.muted }}>{t('roleLabel') ?? 'Rolle'}</Text>
            <Text style={{ ...TYPE.meta, color: c.success, fontWeight: '600' }}>{t('patientRoleLabel')}</Text>
          </View>
        </View>
      </View>

      {/* ── Profil bearbeiten ──────────────────────────────────────── */}
      {!editing ? (
        <Pressable
          onPress={openEdit}
          style={[styles.registerBtn, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginTop: 12 }]}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{t('editProfileBtn')}</Text>
        </Pressable>
      ) : (
        <View style={{ marginTop: 12, gap: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 4 }}>{t('editProfileAction')}</Text>

          <TextInput
            value={editFirst}
            onChangeText={setEditFirst}
            placeholder={t('firstNamePlaceholder')}
            placeholderTextColor={c.muted}
            style={[styles.regInput, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          />
          <TextInput
            value={editLast}
            onChangeText={setEditLast}
            placeholder={t('lastNamePlaceholder') ?? t('lastName')}
            placeholderTextColor={c.muted}
            style={[styles.regInput, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          />

          {!!saveError && <Text style={{ color: c.error, fontSize: 13 }}>{saveError}</Text>}

          <Pressable
            onPress={saveEdit}
            disabled={saving}
            style={[styles.registerBtn, { backgroundColor: saving ? c.border : c.primary, opacity: saving ? 0.7 : 1 }]}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.registerBtnText}>{t('saveBtn')}</Text>
            }
          </Pressable>
          <Pressable onPress={cancelEdit} style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Text style={{ color: c.muted, fontSize: 14 }}>{t('cancelBtn')}</Text>
          </Pressable>
        </View>
      )}

    </ScrollView>
  );
}
