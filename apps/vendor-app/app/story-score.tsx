import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ViewStyle, TextStyle,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'

const AMBER    = '#92400E'
const AMBER_BG = '#FEF3C7'
const BG       = '#FFFBF5'
const SURFACE  = '#F5F0EB'
const BORDER   = '#EDE8E1'
const T1       = '#1A0F00'
const T2       = '#2D1810'
const MUTED    = '#92816E'
const GREEN    = '#2d6a4f'
const GREEN_BG = '#d8f3dc'
const GREEN_BDR= '#b7e4c7'

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function scoreOrigin(text: string): number {
  if (!text.trim()) return 0
  if (text.length < 10) return 4
  const keywords = ['warehouse', 'deadstock', 'vintage', 'thrift', 'export', 'market', 'haul', 'curated', 'delhi', 'bombay', 'mumbai', 'sourced']
  const hits = keywords.filter(k => text.toLowerCase().includes(k)).length
  return Math.min(10, 4 + hits * 2)
}

function scoreBrandEra(text: string): number {
  if (!text.trim()) return 0
  if (text.length < 10) return 4
  const keywords = ['90s', '80s', '2000s', '70s', 'mainline', 'vintage', 'era', 'pre-', 'deadstock', 'original', 'classic', 'heritage']
  const hits = keywords.filter(k => text.toLowerCase().includes(k)).length
  return Math.min(10, 4 + hits * 2)
}

function scoreCondition(text: string): number {
  if (!text.trim()) return 5
  const good = ['mint', 'excellent', 'unworn', 'deadstock', 'new', 'pristine', 'perfect']
  const mid  = ['good', 'great', 'clean', 'washed', 'fresh', 'intact']
  const bad  = ['worn', 'fade', 'stain', 'damage', 'repair', 'hole']
  const t = text.toLowerCase()
  if (good.some(w => t.includes(w))) return 9
  if (bad.some(w => t.includes(w)))  return 5
  if (mid.some(w => t.includes(w)))  return 7
  return 6
}

function deriveTotal(origin: number, brandEra: number, condition: number): number {
  if (origin === 0 && brandEra === 0) return 0
  const scores = [origin, brandEra, brandEra, condition].filter(s => s > 0)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round(avg * 10) / 10
}

function deriveTags(origin: string, brandEra: string, condition: string): string[] {
  const tags: string[] = []
  const o = origin.toLowerCase()
  const b = brandEra.toLowerCase()
  const c = condition.toLowerCase()
  if (o.includes('warehouse') || o.includes('deadstock')) tags.push('Deadstock find')
  if (b.includes('90s') || b.includes("90's"))           tags.push('90s era')
  if (b.includes('2000s') || b.includes('y2k'))          tags.push('Y2K era')
  if (b.includes('80s') || b.includes("80's"))           tags.push('80s era')
  if (b.includes('mainline'))                             tags.push('Mainline label')
  if (c.includes('clean') || c.includes('washed'))       tags.push('Cleaned')
  if (c.includes('unworn') || c.includes('deadstock') || c.includes('mint')) tags.push('Unworn')
  tags.push('Vendor verified')
  return [...new Set(tags)]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StoryScoreScreen() {
  const router = useRouter()
  const { productId, productName } = useLocalSearchParams<{ productId: string; productName: string }>()

  const [origin, setOrigin]           = useState('')
  const [brandEra, setBrandEra]       = useState('')
  const [conditionNotes, setConditionNotes] = useState('')
  const [vendorNote, setVendorNote]   = useState('')

  const [generating, setGenerating]   = useState(false)
  const [saving, setSaving]           = useState(false)
  const [scoreResult, setScoreResult] = useState<null | {
    total: number
    breakdown: { label: string; score: number }[]
    timeline: { label: string; text: string }[]
    tags: string[]
    vendorNote: string
  }>(null)
  const [expanded, setExpanded]       = useState(true)

  function handleGenerate() {
    if (!origin.trim() && !brandEra.trim()) {
      return Alert.alert('Add details', 'Fill in at least the Origin or Brand Era to generate a score.')
    }
    setGenerating(true)
    setTimeout(() => {
      const oScore  = scoreOrigin(origin)
      const bScore  = scoreBrandEra(brandEra)
      const cScore  = scoreCondition(conditionNotes)
      const total   = deriveTotal(oScore, bScore, cScore)
      const tags    = deriveTags(origin, brandEra, conditionNotes)

      setScoreResult({
        total,
        breakdown: [
          { label: 'Origin clarity',    score: oScore },
          { label: 'Brand authenticity', score: bScore },
          { label: 'Era verification',  score: bScore },
          { label: 'Condition',         score: cScore },
        ].filter(b => b.score > 0),
        timeline: [
          origin.trim()       ? { label: 'Origin', text: origin.trim() }       : null,
          brandEra.trim()     ? { label: 'Era',    text: brandEra.trim() }      : null,
          conditionNotes.trim() ? { label: 'Verified', text: `Authenticated by ROORQ team. ${conditionNotes.trim()}` } : { label: 'Verified', text: 'Authenticated by ROORQ team.' },
        ].filter(Boolean) as { label: string; text: string }[],
        tags,
        vendorNote: vendorNote.trim() || '',
      })
      setGenerating(false)
    }, 1400)
  }

  async function handleSave() {
    if (!scoreResult) return
    if (!productId) return Alert.alert('Error', 'Product ID missing.')
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({ story_score: scoreResult })
        .eq('id', productId)
      if (error) throw new Error(error.message)
      Alert.alert(
        '✅ Story Score saved!',
        `The Story Score has been added to "${productName || 'your product'}" and will be visible to buyers on the website.`,
        [{ text: 'Done', onPress: () => router.replace('/(tabs)/listings') }]
      )
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const total = scoreResult?.total ?? 0
  const ringColor = total >= 7 ? GREEN : total >= 5 ? AMBER : '#DC2626'

  return (
    <KeyboardAvoidingView style={vs.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={vs.header}>
        <TouchableOpacity style={vs.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} color={MUTED} />
        </TouchableOpacity>
        <View style={vs.headerText}>
          <Text style={ts.title}>Story Score</Text>
          {productName ? <Text style={ts.subtitle} numberOfLines={1}>{productName}</Text> : null}
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={vs.scroll}
        contentContainerStyle={vs.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Explainer */}
        <View style={vs.infoCard}>
          <Text style={ts.infoTitle}>What is a Story Score?</Text>
          <Text style={ts.infoBody}>
            A Story Score tells buyers exactly where this piece came from, its era, and its condition.
            Products with a story score get{' '}
            <Text style={ts.infoBold}>3× more views</Text>
            {' '}and sell faster.
          </Text>
        </View>

        {/* Input fields */}
        <View style={vs.section}>
          <Text style={ts.sectionLabel}>STORY DETAILS</Text>

          <Text style={ts.fieldLabel}>Origin *</Text>
          <TextInput
            style={ts.input}
            placeholder="e.g. Sourced from a 90s deadstock warehouse, Delhi"
            placeholderTextColor="#9CA3AF"
            value={origin}
            onChangeText={setOrigin}
            returnKeyType="next"
          />

          <Text style={[ts.fieldLabel, { marginTop: 14 }]}>Brand Era *</Text>
          <TextInput
            style={ts.input}
            placeholder="e.g. Pre-diffusion Nike mainline, early 2000s"
            placeholderTextColor="#9CA3AF"
            value={brandEra}
            onChangeText={setBrandEra}
            returnKeyType="next"
          />

          <Text style={[ts.fieldLabel, { marginTop: 14 }]}>Condition Notes</Text>
          <TextInput
            style={[ts.input, ts.textArea]}
            placeholder="e.g. Tags intact, no fading, professionally cleaned"
            placeholderTextColor="#9CA3AF"
            value={conditionNotes}
            onChangeText={setConditionNotes}
            multiline
            numberOfLines={2}
          />

          <Text style={[ts.fieldLabel, { marginTop: 14 }]}>Vendor Note (optional)</Text>
          <TextInput
            style={[ts.input, ts.textArea]}
            placeholder='e.g. "This tee was part of a deadstock batch..."'
            placeholderTextColor="#9CA3AF"
            value={vendorNote}
            onChangeText={setVendorNote}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Generate button */}
        <View style={vs.btnWrap}>
          <TouchableOpacity
            style={[vs.generateBtn, generating && vs.generateBtnBusy]}
            onPress={handleGenerate}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={ts.generateBtn}>Generating...</Text>
              </>
            ) : (
              <>
                <Sparkles size={16} color="#fff" />
                <Text style={ts.generateBtn}>{scoreResult ? 'Regenerate Score' : 'Generate Story Score'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Score result card */}
        {scoreResult && (
          <View style={[vs.scoreCard, { borderColor: GREEN_BDR }]}>
            {/* Header row */}
            <TouchableOpacity style={vs.scoreCardHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
              {/* Ring */}
              <View style={vs.ringWrap}>
                <View style={[vs.ring, { borderColor: ringColor }]}>
                  <Text style={[ts.ringScore, { color: ringColor }]}>{scoreResult.total}</Text>
                  <Text style={[ts.ringDenom, { color: ringColor }]}>/10</Text>
                </View>
              </View>
              <View style={vs.scoreHeaderText}>
                <Text style={ts.scoreTitleGreen}>Story Score</Text>
                <View style={vs.tagsRow}>
                  {scoreResult.tags.slice(0, 2).map(t => (
                    <View key={t} style={vs.scoreTag}>
                      <Text style={ts.scoreTag}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {expanded
                ? <ChevronUp size={18} color={GREEN} />
                : <ChevronDown size={18} color={GREEN} />
              }
            </TouchableOpacity>

            {/* Expandable body */}
            {expanded && (
              <View style={vs.scoreBody}>
                <View style={vs.divider} />

                {/* Breakdown */}
                <Text style={ts.scoreSection}>Score Breakdown</Text>
                {scoreResult.breakdown.map(b => (
                  <View key={b.label} style={vs.breakdownRow}>
                    <Text style={ts.breakdownLabel}>{b.label}</Text>
                    <View style={vs.barTrack}>
                      <View style={[vs.barFill, { width: `${b.score * 10}%` as any }]} />
                    </View>
                    <Text style={ts.breakdownScore}>{b.score}/10</Text>
                  </View>
                ))}

                {/* Timeline */}
                <Text style={[ts.scoreSection, { marginTop: 16 }]}>Item Journey</Text>
                {scoreResult.timeline.map((item, i) => (
                  <View key={i} style={vs.timelineRow}>
                    <View style={vs.timelineLeft}>
                      <View style={vs.timelineDot} />
                      {i < scoreResult.timeline.length - 1 && <View style={vs.timelineLine} />}
                    </View>
                    <View style={vs.timelineContent}>
                      <Text style={ts.timelineLabel}>{item.label}</Text>
                      <Text style={ts.timelineText}>{item.text}</Text>
                    </View>
                  </View>
                ))}

                {/* Vendor note */}
                {scoreResult.vendorNote ? (
                  <View style={vs.vendorNoteCard}>
                    <Text style={ts.vendorNoteLabel}>Vendor Note</Text>
                    <Text style={ts.vendorNoteText}>"{scoreResult.vendorNote}"</Text>
                  </View>
                ) : null}

                {/* All tags */}
                <View style={vs.allTagsRow}>
                  {scoreResult.tags.map(t => (
                    <View key={t} style={vs.allTag}>
                      <Text style={ts.allTag}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom bar */}
      {scoreResult && (
        <View style={vs.bottomBar}>
          <TouchableOpacity
            style={[vs.saveBtn, saving && vs.saveBtnBusy]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={ts.saveBtn}>Save Story Score</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={vs.skipBtn}
            onPress={() => router.replace('/(tabs)/listings')}
          >
            <Text style={ts.skipBtn}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const vs = StyleSheet.create<Record<string, ViewStyle>>({
  screen:          { flex: 1, backgroundColor: BG },
  header:          { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: SURFACE, justifyContent: 'center', alignItems: 'center' },
  headerText:      { flex: 1, paddingHorizontal: 12 },
  scroll:          { flex: 1 },
  scrollContent:   { paddingBottom: 20 },
  infoCard:        { backgroundColor: GREEN_BG, marginHorizontal: 12, marginTop: 16, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: GREEN_BDR },
  section:         { backgroundColor: '#fff', marginTop: 10, paddingHorizontal: 20, paddingVertical: 16 },
  btnWrap:         { marginHorizontal: 12, marginTop: 12 },
  generateBtn:     { backgroundColor: AMBER, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  generateBtnBusy: { opacity: 0.6 },
  scoreCard:       { marginHorizontal: 12, marginTop: 14, backgroundColor: '#f0faf1', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  scoreCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  ringWrap:        { flexShrink: 0 },
  ring:            { width: 52, height: 52, borderRadius: 26, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  scoreHeaderText: { flex: 1 },
  tagsRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  scoreTag:        { backgroundColor: GREEN_BDR, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  scoreBody:       { paddingHorizontal: 16, paddingBottom: 16 },
  divider:         { height: 1, backgroundColor: GREEN_BDR, marginBottom: 14 },
  breakdownRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barTrack:        { flex: 1, height: 6, backgroundColor: GREEN_BDR, borderRadius: 3, overflow: 'hidden' },
  barFill:         { height: '100%', backgroundColor: GREEN, borderRadius: 3 },
  timelineRow:     { flexDirection: 'row', gap: 10, marginBottom: 10 },
  timelineLeft:    { alignItems: 'center', width: 12 },
  timelineDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN, borderWidth: 2, borderColor: '#1b4332' },
  timelineLine:    { flex: 1, width: 2, backgroundColor: '#95d5b2', marginTop: 2 },
  timelineContent: { flex: 1, paddingBottom: 4 },
  vendorNoteCard:  { backgroundColor: GREEN_BDR, borderRadius: 10, padding: 12, marginTop: 10, marginBottom: 8 },
  allTagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  allTag:          { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#95d5b2' },
  bottomBar:       { paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: BORDER },
  saveBtn:         { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnBusy:     { opacity: 0.6 },
  skipBtn:         { alignItems: 'center', paddingTop: 10 },
})

const ts = StyleSheet.create<Record<string, TextStyle>>({
  title:            { fontSize: 16, fontWeight: '700', color: T1, textAlign: 'center' },
  subtitle:         { fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 2 },
  infoTitle:        { fontSize: 13, fontWeight: '700', color: '#1b4332', marginBottom: 4 },
  infoBody:         { fontSize: 12, color: '#2d6a4f', lineHeight: 18 },
  infoBold:         { fontWeight: '700' },
  sectionLabel:     { fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 1, marginBottom: 14 },
  fieldLabel:       { fontSize: 12, fontWeight: '600', color: T2, marginBottom: 6 },
  input:            { backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: T2 },
  generateBtn:      { fontSize: 15, fontWeight: '700', color: '#fff' },
  ringScore:        { fontSize: 16, fontWeight: '800', lineHeight: 20 },
  ringDenom:        { fontSize: 9, fontWeight: '600' },
  scoreTitleGreen:  { fontSize: 14, fontWeight: '700', color: '#1b4332' },
  scoreTag:         { fontSize: 10, fontWeight: '500', color: '#1b4332' },
  scoreSection:     { fontSize: 11, fontWeight: '700', color: GREEN, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  breakdownLabel:   { fontSize: 12, color: '#1b4332', fontWeight: '500', width: 120 },
  breakdownScore:   { fontSize: 12, fontWeight: '700', color: '#1b4332', width: 36, textAlign: 'right' },
  timelineLabel:    { fontSize: 10, fontWeight: '700', color: '#52b788', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  timelineText:     { fontSize: 12, color: '#1b4332', lineHeight: 18 },
  vendorNoteLabel:  { fontSize: 10, fontWeight: '700', color: GREEN, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  vendorNoteText:   { fontSize: 12, color: '#1b4332', lineHeight: 18, fontStyle: 'italic' },
  allTag:           { fontSize: 11, fontWeight: '500', color: '#1b4332' },
  saveBtn:          { fontSize: 15, fontWeight: '700', color: '#fff' },
  skipBtn:          { fontSize: 14, color: MUTED },
  textArea:         { height: 72, textAlignVertical: 'top' } as TextStyle,
})
