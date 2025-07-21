
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface HomepageContent {
  id: string;
  section_name: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const HomepageContentManagement = () => {
  const [content, setContent] = useState<HomepageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    section_name: '',
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('section_name', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch homepage content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      section_name: '',
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      order_index: 0,
      is_active: true,
    });
  };

  const handleAdd = async () => {
    if (actionInProgress) return;
    
    setActionInProgress('add');
    try {
      const { error } = await supabase
        .from('homepage_content')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content added successfully",
      });
      
      await fetchContent();
      setShowAddDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding content:', error);
      toast({
        title: "Error",
        description: "Failed to add content",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEdit = (item: HomepageContent) => {
    setFormData({
      section_name: item.section_name,
      title: item.title,
      description: item.description || '',
      image_url: item.image_url || '',
      link_url: item.link_url || '',
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setEditingId(item.id);
  };

  const handleUpdate = async () => {
    if (!editingId || actionInProgress) return;
    
    setActionInProgress('update');
    try {
      const { error } = await supabase
        .from('homepage_content')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully",
      });
      
      await fetchContent();
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (actionInProgress) return;
    
    setActionInProgress('delete');
    try {
      const { error } = await supabase
        .from('homepage_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      
      await fetchContent();
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Content Management</h1>
          <p className="text-gray-600">Manage your website's homepage content sections</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
              <DialogDescription>
                Create a new homepage content section
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={formData.section_name}
                    onValueChange={(value) => setFormData({ ...formData, section_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="testimonial">Testimonial</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                      <SelectItem value="trusted_partners">Trusted Partners</SelectItem>
                      <SelectItem value="trusted_partners_header">Trusted Partners Header</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Order Index</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/programs"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!formData.title || !formData.section_name || actionInProgress === 'add'}
                >
                  {actionInProgress === 'add' ? 'Adding...' : 'Add Content'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {content.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {item.title}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Section: {item.section_name} • Order: {item.order_index}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    disabled={editingId === item.id}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={actionInProgress === 'delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {editingId === item.id ? (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Section</Label>
                    <Select
                      value={formData.section_name}
                      onValueChange={(value) => setFormData({ ...formData, section_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="testimonial">Testimonial</SelectItem>
                        <SelectItem value="benefits">Benefits</SelectItem>
                        <SelectItem value="trusted_partners">Trusted Partners</SelectItem>
                        <SelectItem value="trusted_partners_header">Trusted Partners Header</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Order Index</Label>
                    <Input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Link URL</Label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={actionInProgress === 'update'}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {actionInProgress === 'update' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <div className="space-y-2">
                  {item.description && (
                    <p className="text-gray-700">{item.description}</p>
                  )}
                  {item.image_url && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Image: </span>
                      <a href={item.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {item.image_url}
                      </a>
                    </div>
                  )}
                  {item.link_url && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Link: </span>
                      <span className="text-sm">{item.link_url}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomepageContentManagement;
